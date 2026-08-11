'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, CheckCircle2, Calendar, Clock, Sparkles } from 'lucide-react';

interface SpaService {
  id: string;
  name: string;
  description: string | null;
  category: string;
  duration: number;
  price: number;
  photoUrl: string | null;
  practitioner: string | null;
}

const CATEGORY_LABELS: Record<string, { label: string; emoji: string }> = {
  massage: { label: 'Massage', emoji: '💆' },
  facial: { label: 'Soin visage', emoji: '✨' },
  body: { label: 'Soin corps', emoji: '🧖' },
  wellness: { label: 'Bien-être', emoji: '🌸' },
  couple: { label: 'Couple', emoji: '💑' },
};

interface SpaModalProps {
  agencyId: string;
  baggageId?: string;
  roomNumber?: string | null;
  guestName?: string | null;
  onClose: () => void;
}

// Génère les créneaux disponibles (9h-19h, par tranches de 30 min)
function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let h = 9; h < 19; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`);
    slots.push(`${String(h).padStart(2, '0')}:30`);
  }
  return slots;
}

export default function SpaModal({ agencyId, baggageId, roomNumber, guestName, onClose }: SpaModalProps) {
  const [services, setServices] = useState<SpaService[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<SpaService | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/spa?agencyId=${agencyId}`)
      .then((r) => r.json())
      .then((data) => { if (data.success) setServices(data.services); })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
    // Date par défaut: demain
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow.toISOString().split('T')[0]);
  }, [agencyId]);

  const submit = async () => {
    if (!selectedService || !selectedDate || !selectedTime) return;
    setSubmitting(true);
    setError(null);
    try {
      const dateObj = new Date(`${selectedDate}T${selectedTime}:00`);
      const res = await fetch('/api/spa/appointment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agencyId,
          spaServiceId: selectedService.id,
          baggageId,
          date: dateObj.toISOString(),
          notes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setConfirmed(true);
      } else {
        setError(data.error || 'Erreur');
      }
    } catch (e) {
      console.error(e);
      setError('Erreur réseau');
    } finally {
      setSubmitting(false);
    }
  };

  const timeSlots = generateTimeSlots();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl my-8">
        {/* HEADER */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-3xl relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white">
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6" />
            <h2 className="text-xl font-bold">Réservation Spa</h2>
          </div>
          <p className="text-purple-50 text-sm mt-1">Détendez-vous pendant votre séjour</p>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {confirmed ? (
            <div className="text-center py-6">
              <CheckCircle2 className="w-16 h-16 mx-auto text-green-500 mb-4" />
              <h3 className="text-lg font-bold text-slate-900 mb-2">Réservation confirmée !</h3>
              <p className="text-sm text-slate-600 mb-4">
                Votre rendez-vous pour <strong>{selectedService?.name}</strong> est confirmé.
              </p>
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-left">
                <p className="text-sm flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-purple-600" />
                  {new Date(`${selectedDate}T${selectedTime}`).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
                <p className="text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-600" />
                  {selectedTime} · {selectedService?.duration} min
                </p>
              </div>
              <button onClick={onClose} className="mt-6 px-6 py-2 bg-slate-800 text-white rounded-xl font-medium">
                Fermer
              </button>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-12">
              <Sparkles className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500">Aucun soin disponible pour l'instant</p>
            </div>
          ) : !selectedService ? (
            // LISTE DES SOINS
            <div className="space-y-3">
              {services.map((s) => {
                const meta = CATEGORY_LABELS[s.category] || { label: s.category, emoji: '💆' };
                return (
                  <button
                    key={s.id}
                    onClick={() => setSelectedService(s)}
                    className="w-full text-left p-4 border-2 border-slate-200 rounded-2xl hover:border-purple-400 hover:bg-purple-50/50 transition flex items-start gap-3"
                  >
                    {s.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={s.photoUrl} alt={s.name} className="w-14 h-14 rounded-xl object-cover" />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center text-2xl">{meta.emoji}</div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold text-slate-900">{s.name}</h3>
                        <span className="text-sm font-bold text-purple-700">{s.price.toLocaleString('fr-FR')}</span>
                      </div>
                      {s.description && <p className="text-xs text-slate-500 mt-0.5">{s.description}</p>}
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {s.duration} min</span>
                        {s.practitioner && <span>· {s.practitioner}</span>}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            // SÉLECTION CRÉNEAU
            <>
              <div className="flex items-center gap-3 mb-4">
                <button
                  onClick={() => setSelectedService(null)}
                  className="text-xs text-purple-600 hover:underline"
                >
                  ← Retour aux soins
                </button>
              </div>
              <div className="bg-purple-50 rounded-xl p-3 mb-4">
                <h3 className="font-bold text-slate-900">{selectedService.name}</h3>
                <p className="text-sm text-purple-700">{selectedService.price.toLocaleString('fr-FR')} FCFA · {selectedService.duration} min</p>
              </div>

              <label className="block text-xs font-bold text-slate-600 mb-2">Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full p-3 border border-slate-200 rounded-xl text-sm mb-4 focus:outline-none focus:border-purple-400"
              />

              <label className="block text-xs font-bold text-slate-600 mb-2">Créneau</label>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {timeSlots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setSelectedTime(slot)}
                    className={`py-2 rounded-lg text-xs font-medium border-2 transition ${
                      selectedTime === slot
                        ? 'border-purple-500 bg-purple-500 text-white'
                        : 'border-slate-200 hover:border-purple-300'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>

              <label className="block text-xs font-bold text-slate-600 mb-2">Notes (optionnel)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Préférences, zones à traiter…"
                className="w-full p-3 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:border-purple-400 mb-4"
              />

              {error && <p className="text-sm text-red-500 bg-red-50 p-2 rounded mb-3">⚠️ {error}</p>}

              <button
                onClick={submit}
                disabled={submitting || !selectedDate || !selectedTime}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Réserver
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
