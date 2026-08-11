'use client';

import { useState } from 'react';
import { Star, CheckCircle2, AlertTriangle, Loader2, X } from 'lucide-react';

interface FeedbackModalProps {
  agencyId: string;
  baggageId?: string;
  agencyName: string;
  onClose: () => void;
}

const CATEGORIES = [
  { value: 'cleanliness', label: 'Propreté', icon: '🧹' },
  { value: 'noise', label: 'Bruit', icon: '🔊' },
  { value: 'service', label: 'Service', icon: '🛎️' },
  { value: 'comfort', label: 'Confort', icon: '🛏️' },
  { value: 'billing', label: 'Facturation', icon: '💰' },
  { value: 'other', label: 'Autre', icon: '📋' },
];

const URGENCIES = [
  { value: 'low', label: 'Faible', color: 'bg-slate-100 text-slate-700' },
  { value: 'normal', label: 'Normale', color: 'bg-blue-100 text-blue-700' },
  { value: 'high', label: 'Élevée', color: 'bg-amber-100 text-amber-700' },
  { value: 'critical', label: 'Critique', color: 'bg-red-100 text-red-700' },
];

export default function FeedbackModal({ agencyId, baggageId, agencyName, onClose }: FeedbackModalProps) {
  const [step, setStep] = useState<'rating' | 'complaint' | 'thankyou' | 'redirect'>('rating');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [feedbackId, setFeedbackId] = useState<string | null>(null);
  const [platforms, setPlatforms] = useState<{ google?: string; tripadvisor?: string; booking?: string; airbnb?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  // Complaint form
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState('normal');

  const submitRating = async (selectedRating: number) => {
    setRating(selectedRating);
    setSubmitting(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agencyId, baggageId, rating: selectedRating, comment }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackId(data.feedbackId);
        if (data.routing === 'public_redirect') {
          setPlatforms(data.platforms || {});
          setStep('redirect');
        } else {
          setStep('complaint');
        }
      }
    } catch (e) { console.error(e); }
    finally { setSubmitting(false); }
  };

  const submitComplaint = async () => {
    if (!feedbackId || !category || !description) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/feedback/complaint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedbackId, agencyId, category, description, urgency }),
      });
      const data = await res.json();
      if (data.success) setStep('thankyou');
    } catch (e) { console.error(e); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl">
        {/* HEADER */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-6 rounded-t-3xl relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white">
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold">Votre avis compte</h2>
          <p className="text-amber-50 text-sm mt-1">Notez votre séjour à {agencyName}</p>
        </div>

        <div className="p-6">
          {/* STEP 1: RATING */}
          {step === 'rating' && (
            <div className="text-center">
              <p className="text-slate-700 mb-6">Comment évaluez-vous votre séjour ?</p>
              <div className="flex justify-center gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => submitRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    disabled={submitting}
                    className="transition-transform hover:scale-110 disabled:opacity-50"
                  >
                    <Star
                      className={`w-12 h-12 ${
                        (hoverRating || rating) >= star
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-slate-100 text-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              {submitting && (
                <div className="flex items-center justify-center text-slate-500">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" /> Envoi…
                </div>
              )}
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Commentaire (optionnel)"
                rows={3}
                className="w-full p-3 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:border-amber-400"
              />
            </div>
          )}

          {/* STEP 2: COMPLAINT FORM (note basse) */}
          {step === 'complaint' && (
            <div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800">
                  Merci pour votre retour. Nous voulons corriger cela. Décrivez le problème et notre direction vous répondra.
                </p>
              </div>

              <label className="block text-xs font-bold text-slate-600 mb-2">Catégorie *</label>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setCategory(c.value)}
                    className={`p-3 rounded-xl border-2 text-xs font-medium transition ${
                      category === c.value
                        ? 'border-amber-400 bg-amber-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{c.icon}</div>
                    {c.label}
                  </button>
                ))}
              </div>

              <label className="block text-xs font-bold text-slate-600 mb-2">Description *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Décrivez le problème…"
                className="w-full p-3 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:border-amber-400 mb-4"
              />

              <label className="block text-xs font-bold text-slate-600 mb-2">Urgence</label>
              <div className="grid grid-cols-4 gap-2 mb-6">
                {URGENCIES.map((u) => (
                  <button
                    key={u.value}
                    onClick={() => setUrgency(u.value)}
                    className={`p-2 rounded-lg text-xs font-medium border-2 transition ${
                      urgency === u.value ? 'border-slate-800 ' + u.color : 'border-slate-200'
                    } ${u.color}`}
                  >
                    {u.label}
                  </button>
                ))}
              </div>

              <button
                onClick={submitComplaint}
                disabled={submitting || !category || !description}
                className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Envoyer ma réclamation
              </button>
            </div>
          )}

          {/* STEP 3: THANK YOU (complaint submitted) */}
          {step === 'thankyou' && (
            <div className="text-center py-6">
              <CheckCircle2 className="w-16 h-16 mx-auto text-green-500 mb-4" />
              <h3 className="text-lg font-bold text-slate-900 mb-2">Merci</h3>
              <p className="text-sm text-slate-600 mb-6">
                Votre réclamation a été transmise à notre direction qui vous contactera dans les plus brefs délais.
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-slate-800 text-white rounded-xl font-medium hover:bg-slate-900"
              >
                Fermer
              </button>
            </div>
          )}

          {/* STEP 4: REDIRECT (note haute) */}
          {step === 'redirect' && (
            <div className="text-center py-4">
              <div className="text-5xl mb-3">⭐⭐⭐⭐⭐</div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Merci pour votre avis positif !</h3>
              <p className="text-sm text-slate-600 mb-6">
                Partagez votre expérience sur une plateforme publique :
              </p>
              <div className="space-y-2">
                {platforms.google && (
                  <a href={platforms.google} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 border-2 border-slate-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition">
                    <span className="text-2xl">🔵</span>
                    <span className="font-medium text-slate-900">Google Reviews</span>
                  </a>
                )}
                {platforms.tripadvisor && (
                  <a href={platforms.tripadvisor} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 border-2 border-slate-200 rounded-xl hover:border-green-400 hover:bg-green-50 transition">
                    <span className="text-2xl">🟢</span>
                    <span className="font-medium text-slate-900">TripAdvisor</span>
                  </a>
                )}
                {platforms.booking && (
                  <a href={platforms.booking} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 border-2 border-slate-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition">
                    <span className="text-2xl">🏨</span>
                    <span className="font-medium text-slate-900">Booking.com</span>
                  </a>
                )}
              </div>
              <button
                onClick={onClose}
                className="mt-4 text-sm text-slate-500 hover:text-slate-700"
              >
                Peut-être plus tard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
