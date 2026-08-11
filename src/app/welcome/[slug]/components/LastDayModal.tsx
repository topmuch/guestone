'use client';

import { useState } from 'react';
import { X, Loader2, CheckCircle2, Luggage, ShowerHead, Plane, QrCode } from 'lucide-react';

interface LastDayModalProps {
  agencyId: string;
  baggageId?: string;
  roomNumber?: string | null;
  guestName?: string | null;
  onClose: () => void;
}

const SERVICES = [
  {
    type: 'luggage',
    label: 'Dépôt bagages',
    description: 'Déposez vos bagages à la réception, récupérez-les avec un code',
    icon: Luggage,
    color: 'from-blue-500 to-cyan-500',
    fields: [
      { key: 'nbBags', label: 'Nombre de bagages', type: 'number', default: 1, min: 1, max: 10 },
      { key: 'dropOffTime', label: 'Heure de dépôt', type: 'time', default: '11:00' },
      { key: 'pickUpTime', label: 'Heure de retrait', type: 'time', default: '17:00' },
    ],
  },
  {
    type: 'shower',
    label: 'Réservation douche',
    description: 'Réservez une douche avant votre départ',
    icon: ShowerHead,
    color: 'from-teal-500 to-emerald-500',
    fields: [
      { key: 'preferredTime', label: 'Heure souhaitée', type: 'time', default: '14:00' },
      { key: 'duration', label: 'Durée (min)', type: 'number', default: 15, min: 10, max: 60 },
    ],
  },
  {
    type: 'transfer',
    label: 'Transfert aéroport',
    description: 'Réservez un transfert vers l'aéroport',
    icon: Plane,
    color: 'from-violet-500 to-purple-500',
    fields: [
      { key: 'destination', label: 'Destination', type: 'text', default: 'Aéroport', placeholder: 'Aéroport, gare…' },
      { key: 'flightTime', label: 'Heure du vol/train', type: 'time', default: '18:00' },
      { key: 'passengers', label: 'Passagers', type: 'number', default: 1, min: 1, max: 8 },
      { key: 'pickupTime', label: 'Heure de prise en charge', type: 'time', default: '15:00' },
    ],
  },
];

export default function LastDayModal({ agencyId, baggageId, roomNumber, guestName, onClose }: LastDayModalProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [details, setDetails] = useState<Record<string, string | number>>({});
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ pickupCode?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedService = SERVICES.find((s) => s.type === selectedType);

  const submit = async () => {
    if (!selectedType) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/last-day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agencyId,
          baggageId,
          type: selectedType,
          details,
          notes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setResult({ pickupCode: data.pickupCode });
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

  const reset = () => {
    setSelectedType(null);
    setDetails({});
    setNotes('');
    setResult(null);
    setError(null);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl my-8">
        {/* HEADER */}
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white p-6 rounded-t-3xl relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white">
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold">Mode Dernier Jour</h2>
          <p className="text-violet-50 text-sm mt-1">
            {roomNumber ? `Chambre ${roomNumber}` : 'Services post check-out'}
          </p>
        </div>

        <div className="p-6">
          {result ? (
            // CONFIRMATION
            <div className="text-center py-4">
              <CheckCircle2 className="w-16 h-16 mx-auto text-green-500 mb-4" />
              <h3 className="text-lg font-bold text-slate-900 mb-2">Demande envoyée !</h3>
              <p className="text-sm text-slate-600 mb-4">
                La réception a été notifiée. Nous confirmerons sous peu.
              </p>
              {result.pickupCode && (
                <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 mb-4">
                  <p className="text-xs text-amber-700 font-semibold mb-1 flex items-center justify-center gap-1">
                    <QrCode className="w-3.5 h-3.5" /> CODE DE RETRAIT BAGAGES
                  </p>
                  <p className="text-3xl font-mono font-bold text-amber-900 tracking-wider">{result.pickupCode}</p>
                  <p className="text-xs text-amber-700 mt-1">Présentez ce code à la réception pour récupérer vos bagages</p>
                </div>
              )}
              <button
                onClick={onClose}
                className="px-6 py-2 bg-slate-800 text-white rounded-xl font-medium"
              >
                Fermer
              </button>
            </div>
          ) : !selectedType ? (
            // SÉLECTION DU SERVICE
            <>
              <p className="text-sm text-slate-600 mb-4 text-center">
                Quel service souhaitez-vous ?
              </p>
              <div className="space-y-3">
                {SERVICES.map((s) => {
                  const Icon = s.icon;
                  return (
                    <button
                      key={s.type}
                      onClick={() => {
                        setSelectedType(s.type);
                        // Initialise les valeurs par défaut
                        const initial: Record<string, string | number> = {};
                        s.fields.forEach((f) => { initial[f.key] = f.default; });
                        setDetails(initial);
                      }}
                      className="w-full text-left p-4 border-2 border-slate-200 rounded-2xl hover:border-violet-400 hover:bg-violet-50/50 transition flex items-start gap-3"
                    >
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center shrink-0`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900">{s.label}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{s.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            // FORMULAIRE DU SERVICE SÉLECTIONNÉ
            <>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${selectedService!.color} flex items-center justify-center`}>
                  <selectedService.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{selectedService!.label}</h3>
                  <button
                    onClick={() => setSelectedType(null)}
                    className="text-xs text-violet-600 hover:underline"
                  >
                    ← Changer de service
                  </button>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                {selectedService!.fields.map((f) => (
                  <div key={f.key}>
                    <label className="block text-xs font-bold text-slate-600 mb-1">{f.label}</label>
                    <input
                      type={f.type}
                      value={details[f.key] ?? ''}
                      onChange={(e) => setDetails({ ...details, [f.key]: f.type === 'number' ? parseInt(e.target.value) || 0 : e.target.value })}
                      min={(f as { min?: number }).min}
                      max={(f as { max?: number }).max}
                      placeholder={(f as { placeholder?: string }).placeholder}
                      className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-400"
                    />
                  </div>
                ))}
              </div>

              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-600 mb-1">Notes (optionnel)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Informations complémentaires…"
                  className="w-full p-3 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:border-violet-400"
                />
              </div>

              {error && <p className="text-sm text-red-500 bg-red-50 p-2 rounded mb-3">⚠️ {error}</p>}

              <button
                onClick={submit}
                disabled={submitting}
                className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Confirmer la demande
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
