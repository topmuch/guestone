'use client';

import { useState, useRef, useEffect } from 'react';
import { AlertTriangle, X, Loader2, CheckCircle2, Bell } from 'lucide-react';

interface ConciergeAlertButtonProps {
  agencyId: string;
  baggageId?: string;
}

/**
 * Alerte Concierge dédiée Airbnb (PRD §15.8)
 * Différente du SOS hôtel (§14.9):
 * - Pas de maintien 3s (plus simple, plus rapide)
 * - Va à la conciergerie, pas à la réception hôtel
 * - Pas de position GPS par défaut (peut être activé)
 */
export default function ConciergeAlertButton({ agencyId, baggageId }: ConciergeAlertButtonProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [shareLocation, setShareLocation] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendAlert = async () => {
    setSending(true);
    setError(null);

    let latitude: number | null = null;
    let longitude: number | null = null;
    if (shareLocation && navigator.geolocation) {
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
        });
        latitude = pos.coords.latitude;
        longitude = pos.coords.longitude;
      } catch {
        // GPS refusé — on envoie quand même
      }
    }

    try {
      // Réutilise l'API last-day ou crée une alerte concierge via service-request
      const res = await fetch('/api/last-day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agencyId,
          baggageId,
          type: 'transfer', // détourné pour alerter concierge
          details: { alertType: 'concierge_urgency', message, shareLocation: !!latitude },
          notes: message,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSent(true);
        setModalOpen(false);
      } else {
        setError(data.error || 'Erreur');
      }
    } catch (e) {
      console.error(e);
      setError('Erreur réseau');
    } finally {
      setSending(false);
    }
  };

  const reset = () => {
    setSent(false);
    setError(null);
    setMessage('');
    setShareLocation(false);
  };

  if (sent) {
    return (
      <div className="bg-white rounded-2xl border border-green-200 p-6 text-center">
        <CheckCircle2 className="w-12 h-12 mx-auto text-green-500 mb-3" />
        <h3 className="font-bold text-slate-900 mb-1">Concierge notifié !</h3>
        <p className="text-sm text-slate-600 mb-4">
          Votre conciergerie a reçu votre message et vous contactera dans les plus brefs délais.
        </p>
        <button onClick={reset} className="px-6 py-2 bg-slate-800 text-white rounded-xl text-sm font-medium">
          Fermer
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg"
      >
        <Bell className="w-5 h-5" />
        Alerter la conciergerie
      </button>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-4">
              <div className="w-14 h-14 mx-auto bg-amber-100 rounded-full flex items-center justify-center mb-3">
                <Bell className="w-7 h-7 text-amber-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Alerter la conciergerie</h3>
              <p className="text-sm text-slate-500 mt-1">Décrivez votre besoin, la conciergerie vous contactera</p>
            </div>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder="Ex: Problème d'eau chaude, bruit, clé perdue…"
              className="w-full p-3 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:border-amber-400 mb-3"
            />

            <label className="flex items-center gap-2 mb-4 cursor-pointer">
              <input
                type="checkbox"
                checked={shareLocation}
                onChange={(e) => setShareLocation(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm text-slate-700">Partager ma position GPS</span>
            </label>

            {error && <p className="text-sm text-red-500 bg-red-50 p-2 rounded mb-3">⚠️ {error}</p>}

            <button
              onClick={sendAlert}
              disabled={sending || !message}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
              Envoyer l'alerte
            </button>

            <p className="text-xs text-slate-400 mt-3 text-center">
              Pour les urgences médicales, appelez directement les secours locaux.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
