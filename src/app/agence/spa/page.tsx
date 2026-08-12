'use client';

import { useState, useEffect } from 'react';
import { Loader2, Sparkles, CheckCircle2, Clock, XCircle, Calendar } from 'lucide-react';

interface Appointment {
  id: string;
  guestName: string | null;
  roomNumber: string | null;
  date: string;
  duration: number;
  price: number;
  status: string;
  notes: string | null;
  spaService: { name: string; category: string; practitioner: string | null };
}

const STATUS_META: Record<string, { label: string; color: string }> = {
  pending: { label: 'En attente', color: 'bg-amber-100 text-amber-700' },
  confirmed: { label: 'Confirmé', color: 'bg-blue-100 text-blue-700' },
  completed: { label: 'Terminé', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Annulé', color: 'bg-red-100 text-red-700' },
  no_show: { label: 'No-show', color: 'bg-slate-100 text-slate-700' },
};

export default function SpaDashboardPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'upcoming' | 'all'>('upcoming');

  useEffect(() => { loadAppointments(); }, []);

  const loadAppointments = async () => {
    try {
      const sessionRes = await fetch('/api/auth/session');
      const sessionData = await sessionRes.json();
      const user = sessionData.user;
      if (!user?.agencyId) return;
      const res = await fetch(`/api/spa/appointment?agencyId=${user.agencyId}`);
      const data = await res.json();
      if (data.success) setAppointments(data.appointments);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/spa/appointment?id=${id}&status=${status}&handledBy=Staff`, { method: 'PATCH' });
    loadAppointments();
  };

  const now = new Date();
  const filtered = filter === 'upcoming'
    ? appointments.filter((a) => new Date(a.date) >= now && (a.status === 'pending' || a.status === 'confirmed'))
    : appointments;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Spa — Réservations</h1>
          <p className="text-sm text-slate-500">Gestion des rendez-vous spa</p>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {[
          { value: 'upcoming', label: '📅 À venir' },
          { value: 'all', label: '📋 Toutes' },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value as 'upcoming' | 'all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === f.value ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 border'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border p-12 text-center">
          <Sparkles className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500">Aucune réservation pour l'instant</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((a) => {
            const meta = STATUS_META[a.status] || STATUS_META.pending;
            const apptDate = new Date(a.date);
            return (
              <div key={a.id} className="bg-white rounded-2xl border p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-slate-900">{a.spaService.name}</h3>
                    <p className="text-sm text-slate-500">
                      {a.guestName || 'Client'} {a.roomNumber && `· Ch. ${a.roomNumber}`}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-sm">
                      <Calendar className="w-4 h-4 text-purple-600" />
                      <span className="font-medium">{apptDate.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                      <Clock className="w-4 h-4 text-purple-600 ml-2" />
                      <span>{apptDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="text-slate-400">· {a.duration} min · {a.price.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                    {a.spaService.practitioner && (
                      <p className="text-xs text-slate-500 mt-1">Praticien: {a.spaService.practitioner}</p>
                    )}
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${meta.color}`}>{meta.label}</span>
                </div>

                {a.notes && <p className="text-sm text-amber-700 bg-amber-50 p-2 rounded-lg mb-3">📝 {a.notes}</p>}

                <div className="flex gap-2">
                  {a.status === 'pending' && (
                    <button onClick={() => updateStatus(a.id, 'confirmed')} className="flex-1 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700">
                      Confirmer
                    </button>
                  )}
                  {(a.status === 'pending' || a.status === 'confirmed') && (
                    <>
                      <button onClick={() => updateStatus(a.id, 'completed')} className="flex-1 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Terminer
                      </button>
                      <button onClick={() => updateStatus(a.id, 'cancelled')} className="px-4 py-2 bg-red-100 text-red-700 text-sm font-medium rounded-lg hover:bg-red-200 flex items-center gap-1">
                        <XCircle className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
