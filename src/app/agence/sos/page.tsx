'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Loader2, MapPin, Phone, CheckCircle2, XCircle, ExternalLink } from 'lucide-react';

interface SosAlert {
  id: string;
  guestName: string | null;
  roomNumber: string | null;
  guestPhone: string | null;
  latitude: number | null;
  longitude: number | null;
  message: string | null;
  status: string;
  handledBy: string | null;
  acknowledgedAt: string | null;
  resolvedAt: string | null;
  resolutionNote: string | null;
  isFalseAlarm: boolean;
  createdAt: string;
}

const STATUS_META: Record<string, { label: string; color: string; icon: string }> = {
  active: { label: 'Active', color: 'bg-red-100 text-red-700 border-red-300', icon: '🚨' },
  acknowledged: { label: 'Vue', color: 'bg-amber-100 text-amber-700 border-amber-300', icon: '👁️' },
  in_progress: { label: 'En cours', color: 'bg-blue-100 text-blue-700 border-blue-300', icon: '🔧' },
  resolved: { label: 'Résolue', color: 'bg-green-100 text-green-700 border-green-300', icon: '✅' },
  false_alarm: { label: 'Fausse alerte', color: 'bg-slate-100 text-slate-700 border-slate-300', icon: '❌' },
};

export default function SosDashboardPage() {
  const [alerts, setAlerts] = useState<SosAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<SosAlert | null>(null);

  useEffect(() => {
    loadAlerts();
    // Polling 10s pour les alertes actives
    const interval = setInterval(loadAlerts, 10_000);
    return () => clearInterval(interval);
  }, []);

  const loadAlerts = async () => {
    try {
      const sessionRes = await fetch('/api/auth/session');
      const sessionData = await sessionRes.json();
      const user = sessionData.user;
      if (!user?.agencyId) return;
      const res = await fetch(`/api/sos-alert?agencyId=${user.agencyId}`);
      const data = await res.json();
      if (data.success) {
        setAlerts(data.alerts);
        // Met à jour l'alerte sélectionnée si elle existe encore
        if (selected) {
          const updated = data.alerts.find((a: SosAlert) => a.id === selected.id);
          if (updated) setSelected(updated);
        }
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const updateStatus = async (id: string, status: string, isFalseAlarm = false) => {
    try {
      const res = await fetch('/api/sos-alert', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id, status,
          isFalseAlarm,
          handledBy: 'Staff',
        }),
      });
      if (res.ok) loadAlerts();
    } catch (e) { console.error(e); }
  };

  const activeAlerts = alerts.filter((a) => a.status === 'active' || a.status === 'acknowledged' || a.status === 'in_progress');
  const resolvedAlerts = alerts.filter((a) => a.status === 'resolved' || a.status === 'false_alarm');

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center">
          <AlertTriangle className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Alertes SOS</h1>
          <p className="text-sm text-slate-500">Dashboard staff — intervention en temps réel</p>
        </div>
      </div>

      {/* BADGE ALERTES ACTIVES */}
      {activeAlerts.length > 0 && (
        <div className="bg-red-600 text-white rounded-2xl p-4 mb-6 flex items-center gap-3 animate-pulse">
          <AlertTriangle className="w-8 h-8" />
          <div>
            <p className="text-lg font-bold">{activeAlerts.length} alerte(s) active(s)</p>
            <p className="text-sm text-red-100">Intervention requise immédiatement</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-red-500" />
        </div>
      ) : alerts.length === 0 ? (
        <div className="bg-white rounded-2xl border p-12 text-center">
          <CheckCircle2 className="w-12 h-12 mx-auto text-green-400 mb-3" />
          <p className="text-slate-600">Aucune alerte SOS à ce jour</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-4">
          {/* LISTE */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-slate-700 uppercase">Alertes actives ({activeAlerts.length})</h2>
            {activeAlerts.map((a) => {
              const meta = STATUS_META[a.status] || STATUS_META.active;
              const isSelected = selected?.id === a.id;
              return (
                <button
                  key={a.id}
                  onClick={() => setSelected(a)}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition ${
                    isSelected ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white hover:border-red-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{meta.icon}</span>
                      <div>
                        <p className="font-semibold text-slate-900">{a.guestName || 'Client inconnu'}</p>
                        {a.roomNumber && <p className="text-xs text-slate-500">Chambre {a.roomNumber}</p>}
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-bold border ${meta.color}`}>
                      {meta.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {new Date(a.createdAt).toLocaleString('fr-FR')}
                  </p>
                </button>
              );
            })}

            <h2 className="text-sm font-bold text-slate-700 uppercase mt-6">Historique ({resolvedAlerts.length})</h2>
            {resolvedAlerts.slice(0, 10).map((a) => {
              const meta = STATUS_META[a.status] || STATUS_META.resolved;
              return (
                <button
                  key={a.id}
                  onClick={() => setSelected(a)}
                  className="w-full text-left p-3 rounded-xl border border-slate-200 bg-white opacity-75 hover:opacity-100"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{meta.icon}</span>
                      <span className="text-sm font-medium text-slate-900">{a.guestName || 'Client'}</span>
                      {a.roomNumber && <span className="text-xs text-slate-500">· Ch. {a.roomNumber}</span>}
                    </div>
                    <span className="text-xs text-slate-500">{new Date(a.createdAt).toLocaleDateString('fr-FR')}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* DÉTAILS */}
          <div className="bg-white rounded-2xl border p-5 sticky top-6 h-fit">
            {!selected ? (
              <div className="text-center py-12">
                <AlertTriangle className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                <p className="text-slate-500">Sélectionnez une alerte pour voir les détails</p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{selected.guestName || 'Client inconnu'}</h3>
                    <p className="text-sm text-slate-500">{new Date(selected.createdAt).toLocaleString('fr-FR')}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  {selected.roomNumber && (
                    <div className="bg-slate-50 rounded-xl p-3">
                      <p className="text-xs text-slate-500">Chambre</p>
                      <p className="font-bold text-slate-900">{selected.roomNumber}</p>
                    </div>
                  )}
                  {selected.guestPhone && (
                    <a href={`tel:${selected.guestPhone}`} className="bg-green-50 rounded-xl p-3 hover:bg-green-100 transition">
                      <p className="text-xs text-slate-500">Téléphone</p>
                      <p className="font-bold text-green-700 flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {selected.guestPhone}
                      </p>
                    </a>
                  )}
                </div>

                {selected.message && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
                    <p className="text-xs font-semibold text-amber-700 mb-1">Message du client</p>
                    <p className="text-sm text-amber-900">{selected.message}</p>
                  </div>
                )}

                {/* POSITION GPS */}
                {selected.latitude && selected.longitude && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> Position du client
                      {(selected.status === 'active' || selected.status === 'acknowledged' || selected.status === 'in_progress') && (
                        <span className="ml-2 text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-bold animate-pulse">● LIVE</span>
                      )}
                    </p>
                    <a
                      href={`https://www.google.com/maps?q=${selected.latitude},${selected.longitude}`}
                      target="_blank" rel="noopener noreferrer"
                      className="block bg-slate-100 rounded-xl p-3 hover:bg-slate-200 transition"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-slate-500">Lat: {selected.latitude.toFixed(5)}, Lng: {selected.longitude.toFixed(5)}</p>
                          <p className="text-sm font-medium text-blue-600 flex items-center gap-1 mt-1">
                            <ExternalLink className="w-3 h-3" /> Voir sur Google Maps
                          </p>
                        </div>
                        <MapPin className="w-8 h-8 text-red-500" />
                      </div>
                    </a>
                    {/* V3: Historique des pings GPS */}
                    <SosTrackingHistory alertId={selected.id} />
                  </div>
                )}

                {/* ACTIONS */}
                {selected.status === 'active' && (
                  <button
                    onClick={() => updateStatus(selected.id, 'acknowledged')}
                    className="w-full py-3 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 mb-2"
                  >
                    👁️ J'ai vu l'alerte
                  </button>
                )}
                {(selected.status === 'acknowledged' || selected.status === 'in_progress') && (
                  <>
                    <button
                      onClick={() => updateStatus(selected.id, 'in_progress')}
                      className="w-full py-3 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 mb-2"
                    >
                      🔧 En cours d'intervention
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateStatus(selected.id, 'resolved')}
                        className="flex-1 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Résolu
                      </button>
                      <button
                        onClick={() => updateStatus(selected.id, 'false_alarm', true)}
                        className="flex-1 py-3 bg-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-400 flex items-center justify-center gap-1.5"
                      >
                        <XCircle className="w-4 h-4" /> Fausse alerte
                      </button>
                    </div>
                  </>
                )}

                {selected.status === 'resolved' && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                    <CheckCircle2 className="w-8 h-8 mx-auto text-green-500 mb-1" />
                    <p className="text-sm font-semibold text-green-700">Alerte résolue</p>
                    {selected.resolvedAt && (
                      <p className="text-xs text-green-600 mt-1">{new Date(selected.resolvedAt).toLocaleString('fr-FR')}</p>
                    )}
                  </div>
                )}

                {selected.status === 'false_alarm' && (
                  <div className="bg-slate-100 border border-slate-200 rounded-xl p-3 text-center">
                    <XCircle className="w-8 h-8 mx-auto text-slate-400 mb-1" />
                    <p className="text-sm font-semibold text-slate-600">Fausse alerte</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// V3: Composant affichant l'historique des pings GPS d'une alerte SOS
function SosTrackingHistory({ alertId }: { alertId: string }) {
  const [pings, setPings] = useState<{ latitude: number; longitude: number; createdAt: string }[]>([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    const fetchPings = async () => {
      try {
        const res = await fetch(`/api/sos-alert/ping?alertId=${alertId}`);
        const data = await res.json();
        if (data.success) setPings(data.pings || []);
      } catch {}
    };
    fetchPings();
    // Polling 10s pour temps réel
    interval = setInterval(fetchPings, 10_000);
    return () => { if (interval) clearInterval(interval); };
  }, [alertId]);

  if (pings.length === 0) return null;

  return (
    <div className="mt-2 bg-slate-50 rounded-xl p-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between text-xs font-semibold text-slate-600"
      >
        <span>📍 Historique GPS ({pings.length} pings)</span>
        <span>{expanded ? '▲' : '▼'}</span>
      </button>
      {expanded && (
        <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
          {pings.map((p, i) => (
            <div key={i} className="text-[10px] text-slate-500 flex justify-between">
              <span>{new Date(p.createdAt).toLocaleTimeString('fr-FR')}</span>
              <span className="font-mono">{p.latitude.toFixed(4)}, {p.longitude.toFixed(4)}</span>
            </div>
          ))}
        </div>
      )}
      {/* Lien vers Google Maps avec tous les pings (polyline) */}
      <a
        href={`https://www.google.com/maps/dir/${pings.slice().reverse().map((p) => `${p.latitude},${p.longitude}`).join('/')}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block mt-2 text-xs text-blue-600 hover:underline"
      >
        Voir le trajet complet →
      </a>
    </div>
  );
}
