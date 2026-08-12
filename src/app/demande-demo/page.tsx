'use client';

import { useState } from 'react';
import { Check, Loader2, ArrowRight, Hotel, Home, Building2 } from 'lucide-react';

const EMERALD = '#10B981';
const BLUE = '#2563EB';

export default function DemandeDemoPage() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', establishmentName: '',
    type: 'hotel', nbRooms: '1-10', city: '', country: 'Sénégal', message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Simulation d'envoi (le vrai backend peut être ajouté plus tard)
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 1500);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #ECFDF5, #EFF6FF)' }}>
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md text-center">
          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: `${EMERALD}15` }}>
            <Check className="w-8 h-8" style={{ color: EMERALD }} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Demande envoyée !</h1>
          <p className="text-slate-600 mb-6">
            Merci {form.name}. Notre équipe vous contactera sous 24h pour planifier votre démo personnalisée.
          </p>
          <a href="/" className="inline-block px-6 py-3 text-white font-bold rounded-xl" style={{ background: `linear-gradient(135deg, ${EMERALD}, ${BLUE})` }}>
            Retour à l'accueil
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20" style={{ background: 'linear-gradient(135deg, #ECFDF5 0%, #F8FAFC 50%, #EFF6FF 100%)' }}>
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
            Demandez votre démo gratuite
          </h1>
          <p className="text-lg text-slate-600">
            Découvrez Guest One en 30 minutes. Sans engagement.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Type d'établissement */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Type d'établissement *</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'hotel', label: 'Hôtel', icon: Hotel },
                  { value: 'airbnb', label: 'Airbnb', icon: Home },
                  { value: 'conciergerie', label: 'Conciergerie', icon: Building2 },
                ].map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setForm({ ...form, type: t.value })}
                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition ${
                      form.type === t.value ? 'border-blue-500 bg-blue-50' : 'border-slate-200'
                    }`}
                  >
                    <t.icon className="w-6 h-6" style={{ color: form.type === t.value ? BLUE : '#94a3b8' }} />
                    <span className="text-sm font-medium">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Nom + Email */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Nom complet *</label>
                <input
                  type="text" required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full p-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-400"
                  placeholder="Aminata Diallo"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Email *</label>
                <input
                  type="email" required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full p-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-400"
                  placeholder="aminata@hotel-baobab.com"
                />
              </div>
            </div>

            {/* Téléphone + Établissement */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Téléphone *</label>
                <input
                  type="tel" required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full p-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-400"
                  placeholder="+221 77 123 45 67"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Nom de l'établissement *</label>
                <input
                  type="text" required
                  value={form.establishmentName}
                  onChange={(e) => setForm({ ...form, establishmentName: e.target.value })}
                  className="w-full p-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-400"
                  placeholder="Hôtel Baobab"
                />
              </div>
            </div>

            {/* Ville + Pays */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Ville *</label>
                <input
                  type="text" required
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full p-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-400"
                  placeholder="Dakar"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Pays</label>
                <input
                  type="text"
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  className="w-full p-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-400"
                />
              </div>
            </div>

            {/* Nombre de chambres */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Nombre de chambres / logements</label>
              <select
                value={form.nbRooms}
                onChange={(e) => setForm({ ...form, nbRooms: e.target.value })}
                className="w-full p-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-400"
              >
                <option value="1-10">1 à 10</option>
                <option value="11-30">11 à 30</option>
                <option value="31-50">31 à 50</option>
                <option value="50+">Plus de 50</option>
              </select>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Message (optionnel)</label>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                rows={3}
                className="w-full p-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 resize-none"
                placeholder="Parlez-nous de vos besoins spécifiques…"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 text-white font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ background: `linear-gradient(135deg, ${EMERALD}, ${BLUE})` }}
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Demander ma démo <ArrowRight className="w-5 h-5" /></>}
            </button>

            <p className="text-xs text-slate-400 text-center">
              Réponse sous 24h · Sans engagement · Démo personnalisée
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
