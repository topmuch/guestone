'use client';

import { useState, useEffect } from 'react';
import { Loader2, Luggage, ShowerHead, Plane, CheckCircle2, XCircle, QrCode } from 'lucide-react';

interface LastDayRequest {
  id: string;
  guestName: string | null;
  roomNumber: string | null;
  type: string;
  details: string | null;
  notes: string | null;
  status: string;
  pickupCode: string | null;
  createdAt: string;
}

const TYPE_META: Record<string, { label: string; icon: typeof Luggage; color: string }> = {
  luggage: { label: 'Dépôt bagages', icon: Luggage, color: 'bg-blue-100 text-blue-700' },
  shower: { label: 'Douche', icon: ShowerHead, color: 'bg-teal-100 text-teal-700' },
  transfer: { label: 'Transfert', icon: Plane, color: 'bg-violet-100 text-violet-700' },
};

export default function LastDayDashboardPage() {
  const [requests, setRequests] = useState<LastDayRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'active' | 'all'>('active');

  useEffect(() => { loadRequests(); }, []);

  const loadRequests = async () => {
    try {
      const { getSession } = await import('@/lib/session');
      const user = await getSession();
      if (!user?.agencyId) return;
      const res = await fetch(`/api/last-day?agencyId=${user.agencyId}`);
      const data = await res.json();
      if (data.success) setRequests(data.requests);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/last-day?id=${id}&status=${status}&handledBy=Staff`, { method: 'PATCH' });
    loadRequests();
  };

  const filteredRequests = filter === 'active'
    ? requests.filter((r) => r.status === 'pending' || r.status === 'confirmed')
    : requests;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-violet-600 flex items-center justify-center">
          <Luggage className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mode Dernier Jour</h1>
          <p className="text-sm text-slate-500">Dépôt bagages, douche, transferts</p>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {[
          { value: 'active', label: '🟠 Actives' },
          { value: 'all', label: '📋 Toutes' },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value as 'active' | 'all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === f.value ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 border'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white rounded-2xl border p-12 text-center">
          <Luggage className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500">Aucune demande pour l'instant</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRequests.map((r) => {
            const meta = TYPE_META[r.type] || { label: r.type, icon: Luggage, color: 'bg-slate-100 text-slate-700' };
            const Icon = meta.icon;
            let details: Record<string, string | number> = {};
            try { details = r.details ? JSON.parse(r.details) : {}; } catch {}
            return (
              <div key={r.id} className="bg-white rounded-2xl border p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${meta.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{meta.label}</h3>
                      <p className="text-xs text-slate-500">
                        {r.guestName || 'Client'} {r.roomNumber && `· Ch. ${r.roomNumber}`} · {new Date(r.createdAt).toLocaleString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                    r.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                    r.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                    r.status === 'completed' ? 'bg-green-100 text-green-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {r.status}
                  </span>
                </div>

                {/* Détails */}
                {Object.keys(details).length > 0 && (
                  <div className="bg-slate-50 rounded-xl p-3 mb-3">
                    {Object.entries(details).map(([k, v]) => (
                      <div key={k} className="flex justify-between text-sm py-0.5">
                        <span className="text-slate-500 capitalize">{k}:</span>
                        <span className="font-medium text-slate-900">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pickup code */}
                {r.pickupCode && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3 flex items-center gap-3">
                    <QrCode className="w-6 h-6 text-amber-600" />
                    <div>
                      <p className="text-xs text-amber-700 font-semibold">Code de retrait bagages</p>
                      <p className="text-xl font-mono font-bold text-amber-900 tracking-wider">{r.pickupCode}</p>
                    </div>
                  </div>
                )}

                {r.notes && (
                  <p className="text-sm text-slate-600 bg-slate-50 p-2 rounded-lg mb-3">📝 {r.notes}</p>
                )}

                {/* Actions */}
                {r.status === 'pending' && (
                  <button
                    onClick={() => updateStatus(r.id, 'confirmed')}
                    className="w-full py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700"
                  >
                    Confirmer
                  </button>
                )}
                {r.status === 'confirmed' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateStatus(r.id, 'completed')}
                      className="flex-1 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Terminer
                    </button>
                    <button
                      onClick={() => updateStatus(r.id, 'cancelled')}
                      className="px-4 py-2 bg-red-100 text-red-700 text-sm font-medium rounded-lg hover:bg-red-200 flex items-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4" /> Annuler
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
