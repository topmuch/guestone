'use client';

import { useState, useRef, useEffect } from 'react';
import { AlertTriangle, X, Loader2, CheckCircle2, MapPin } from 'lucide-react';

interface SosButtonProps {
  agencyId: string;
  baggageId?: string;
}

export default function SosButton({ agencyId, baggageId }: SosButtonProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [pressing, setPressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [alertId, setAlertId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tracking, setTracking] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const trackIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const HOLD_DURATION_MS = 3000; // 3 secondes

  const startPress = () => {
    setPressing(true);
    setProgress(0);
    const startTime = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, (elapsed / HOLD_DURATION_MS) * 100);
      setProgress(pct);
      if (pct >= 100) {
        stopPress();
        triggerSos();
      }
    }, 50);
  };

  const stopPress = () => {
    setPressing(false);
    setProgress(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (trackIntervalRef.current) clearInterval(trackIntervalRef.current);
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const triggerSos = async () => {
    setModalOpen(false);
    setSending(true);
    setError(null);

    // Demande la position GPS
    let latitude: number | null = null;
    let longitude: number | null = null;
    if (navigator.geolocation) {
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
          });
        });
        latitude = pos.coords.latitude;
        longitude = pos.coords.longitude;
      } catch {
        // GPS refusé — on envoie quand même sans position
      }
    }

    try {
      const res = await fetch('/api/sos-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agencyId, baggageId, latitude, longitude }),
      });
      const data = await res.json();
      if (data.success) {
        setAlertId(data.alertId);
        setSent(true);
        // V3: Démarre le tracking GPS temps réel (ping toutes les 30s)
        startGpsTracking(data.alertId);
      } else {
        setError(data.error || 'Erreur');
      }
    } catch {
      setError('Erreur réseau');
    } finally {
      setSending(false);
    }
  };

  // V3: Tracking GPS temps réel — envoie la position toutes les 30s
  const startGpsTracking = (id: string) => {
    if (!navigator.geolocation) return;
    setTracking(true);

    // Watch position (mise à jour auto quand le GPS bouge)
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        sendPing(id, pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy, pos.coords.speed, pos.coords.heading);
      },
      () => { /* GPS error — silencieux */ },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 30000 }
    );

    // Backup: ping toutes les 30s même si pas de mouvement
    trackIntervalRef.current = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          sendPing(id, pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy, pos.coords.speed, pos.coords.heading);
        },
        () => {},
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }, 30_000);
  };

  const sendPing = async (id: string, lat: number, lng: number, accuracy?: number, speed?: number, heading?: number) => {
    try {
      await fetch('/api/sos-alert/ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alertId: id,
          latitude: lat,
          longitude: lng,
          accuracy: accuracy || null,
          speed: speed || null,
          heading: heading || null,
        }),
      });
    } catch {
      // Silencieux — on ne crash pas pour un ping
    }
  };

  const stopTracking = () => {
    if (trackIntervalRef.current) {
      clearInterval(trackIntervalRef.current);
      trackIntervalRef.current = null;
    }
    if (watchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setTracking(false);
  };

  const reset = () => {
    stopTracking();
    setSent(false);
    setError(null);
    setSending(false);
    setAlertId(null);
  };

  // Si envoi en cours
  if (sending) {
    return (
      <div className="fixed inset-0 bg-red-900/80 flex items-center justify-center z-50">
        <div className="text-center text-white">
          <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4" />
          <p className="text-xl font-bold">Envoi de l'alerte SOS…</p>
          <p className="text-red-200 text-sm mt-2">Veuillez patienter</p>
        </div>
      </div>
    );
  }

  // Si envoyé
  if (sent) {
    return (
      <div className="fixed inset-0 bg-green-900/80 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl p-8 max-w-sm text-center">
          <CheckCircle2 className="w-16 h-16 mx-auto text-green-500 mb-4" />
          <h3 className="text-xl font-bold text-slate-900 mb-2">Alerte envoyée</h3>
          <p className="text-sm text-slate-600 mb-2">
            La réception a été notifiée avec votre position. L'aide arrive.
          </p>
          {tracking && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4 flex items-center justify-center gap-2">
              <MapPin className="w-4 h-4 text-green-600 animate-pulse" />
              <p className="text-xs text-green-700 font-medium">Position suivie en temps réel</p>
            </div>
          )}
          <button
            onClick={reset}
            className="px-6 py-2 bg-slate-800 text-white rounded-xl font-medium"
          >
            Arrêter le suivi
          </button>
        </div>
      </div>
    );
  }

  // Si erreur
  if (error) {
    return (
      <div className="fixed inset-0 bg-red-900/80 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl p-8 max-w-sm text-center">
          <AlertTriangle className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <h3 className="text-xl font-bold text-slate-900 mb-2">Erreur</h3>
          <p className="text-sm text-slate-600 mb-6">{error}</p>
          <button onClick={reset} className="px-6 py-2 bg-slate-800 text-white rounded-xl font-medium">
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* BOUTON SOS (toujours visible) */}
      <button
        onClick={() => setModalOpen(true)}
        className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg"
      >
        <AlertTriangle className="w-5 h-5" />
        SOS
      </button>

      {/* MODAL DE CONFIRMATION (maintenir 3s) */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-5xl mb-3">🆘</div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Alerte SOS</h3>
            <p className="text-sm text-slate-600 mb-6">
              Maintenez le bouton <strong>3 secondes</strong> pour déclencher l'alerte.
              Votre position sera partagée avec la réception.
            </p>

            <button
              onMouseDown={startPress}
              onMouseUp={stopPress}
              onMouseLeave={stopPress}
              onTouchStart={startPress}
              onTouchEnd={stopPress}
              className="relative w-32 h-32 mx-auto rounded-full bg-red-600 text-white font-bold text-lg shadow-2xl select-none"
              style={{
                transform: pressing ? 'scale(0.95)' : 'scale(1)',
                transition: 'transform 0.1s',
              }}
            >
              {/* Progress ring */}
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="4" />
                <circle
                  cx="50" cy="50" r="45" fill="none" stroke="white" strokeWidth="4"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="relative z-10">SOS</span>
            </button>

            {pressing && (
              <p className="text-sm text-red-600 mt-4 font-medium">
                Maintenez… {Math.ceil((100 - progress) / 100 * 3)}s
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
