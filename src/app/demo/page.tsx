'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { QrCode, Smartphone, RefreshCw, ArrowRight, Clock, Check, Hotel, Bell, ShoppingCart, Sparkles } from 'lucide-react';

const EMERALD = '#10B981';
const BLUE = '#2563EB';

export default function DemoPage() {
  const [resetting, setResetting] = useState(false);
  const [lastReset, setLastReset] = useState<Date | null>(null);
  const [nextReset, setNextReset] = useState<Date | null>(null);

  useEffect(() => {
    // Calcule la prochaine réinitialisation (toutes les heures pile)
    const now = new Date();
    const next = new Date(now);
    next.setMinutes(60 - now.getMinutes(), 0, 0); // prochaine heure pile
    // Si on est à 0 min, la prochaine est dans 1h
    if (now.getMinutes() === 0) {
      next.setHours(now.getHours() + 1);
    }
    setNextReset(next);
    setLastReset(new Date(now.getTime() - now.getMinutes() * 60 * 1000));
  }, []);

  const handleReset = async () => {
    setResetting(true);
    try {
      await fetch('/api/demo/reset', { method: 'POST' });
      setLastReset(new Date());
      const next = new Date();
      next.setHours(next.getHours() + 1, 0, 0, 0);
      setNextReset(next);
    } catch (e) { console.error(e); }
    finally { setResetting(false); }
  };

  // L'URL du QR code — pointe vers la page welcome de l'agence démo
  const demoUrl = typeof window !== 'undefined' ? `${window.location.origin}/welcome/demo-guest-one?context=WRISTBAND&lang=fr&ref=DEMO-QRCODE` : '';

  // QR code via API qrcode (service gratuit)
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(demoUrl)}&bgcolor=ffffff&color=134288&margin=10`;

  const features = [
    { icon: Bell, label: 'Demandes', color: EMERALD },
    { icon: ShoppingCart, label: 'Room Service', color: BLUE },
    { icon: Sparkles, label: 'Spa', color: EMERALD },
    { icon: Hotel, label: 'Retour hôtel', color: BLUE },
  ];

  return (
    <div className="min-h-screen pt-20" style={{ background: 'linear-gradient(135deg, #ECFDF5 0%, #F8FAFC 50%, #EFF6FF 100%)' }}>
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4" style={{ backgroundColor: `${EMERALD}15` }}>
            <Clock className="w-4 h-4" style={{ color: EMERALD }} />
            <span className="text-sm font-semibold" style={{ color: EMERALD }}>Démo interactive · Réinitialisation toutes les heures</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
            Essayez Guest One maintenant
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Scannez ce QR code avec votre téléphone pour découvrir l'expérience client. Un véritable bracelet connecté, sans installation.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* QR Code */}
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
            <div className="mb-4">
              <div className="w-64 h-64 mx-auto bg-white rounded-2xl border-4 border-slate-100 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {demoUrl ? (
                  <img src={qrCodeUrl} alt="QR Code démo Guest One" className="w-full h-full rounded-xl" />
                ) : (
                  <QrCode className="w-48 h-48 text-slate-300" />
                )}
              </div>
            </div>
            <p className="text-sm font-bold text-slate-900 mb-1">QR Code de la démo</p>
            <p className="text-xs text-slate-500 mb-4">Ouvrez l'appareil photo de votre téléphone et scannez ce code</p>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-4">
              <p className="text-xs text-emerald-700 font-semibold mb-1">📋 Bracelet démo</p>
              <p className="text-sm text-emerald-900">Référence : <code className="font-mono font-bold">DEMO-QRCODE</code></p>
              <p className="text-xs text-emerald-700">Chambre 101 · Client Démo</p>
            </div>

            <a
              href={demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 text-white font-bold rounded-xl w-full justify-center"
              style={{ background: `linear-gradient(135deg, ${EMERALD}, ${BLUE})` }}
            >
              <Smartphone className="w-5 h-5" />
              Ouvrir la démo sur cet appareil
            </a>
          </div>

          {/* Info */}
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Ce que vous allez découvrir</h2>
            <div className="space-y-3 mb-6">
              {features.map((f, i) => (
                <div key={i} className="flex items-center gap-3 bg-white rounded-2xl p-4 border border-slate-100">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${f.color}15` }}>
                    <f.icon className="w-5 h-5" style={{ color: f.color }} />
                  </div>
                  <span className="font-medium text-slate-900">{f.label}</span>
                  <Check className="w-4 h-4 ml-auto" style={{ color: EMERALD }} />
                </div>
              ))}
            </div>

            {/* Reset info */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <RefreshCw className="w-5 h-5" style={{ color: BLUE }} />
                <h3 className="font-bold text-slate-900">Réinitialisation automatique</h3>
              </div>
              <p className="text-sm text-slate-600 mb-3">
                La démo se réinitialise toutes les heures. Toutes les demandes, commandes et avis sont effacés.
              </p>
              {nextReset && (
                <p className="text-xs text-slate-500">
                  Prochaine réinitialisation : <strong>{nextReset.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</strong>
                </p>
              )}
              <button
                onClick={handleReset}
                disabled={resetting}
                className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-white border border-blue-200 rounded-lg text-sm font-bold text-blue-700 hover:bg-blue-50 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${resetting ? 'animate-spin' : ''}`} />
                Réinitialiser maintenant
              </button>
            </div>

            <Link href="/demande-demo" className="inline-flex items-center gap-2 text-sm font-bold" style={{ color: BLUE }}>
              Demander une démo personnalisée <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Note */}
        <div className="mt-12 bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3">
          <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-900 mb-1">Note importante</p>
            <p className="text-sm text-amber-800">
              Cette démo est publique et partagée. Toutes les actions que vous effectuez (demandes, commandes, avis) sont visibles par les autres utilisateurs de la démo et seront effacées à la prochaine réinitialisation. Ne saisissez pas de données personnelles.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
