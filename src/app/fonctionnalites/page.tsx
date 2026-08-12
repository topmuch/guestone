'use client';

import Link from 'next/link';
import { Hotel, Home, ArrowRight, Check } from 'lucide-react';

const EMERALD = '#10B981';
const BLUE = '#2563EB';

export default function FonctionnalitesPage() {
  return (
    <div className="min-h-screen pt-20" style={{ background: 'linear-gradient(135deg, #ECFDF5 0%, #F8FAFC 50%, #EFF6FF 100%)' }}>
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
            Toutes les fonctionnalités Guest One
          </h1>
          <p className="text-lg text-slate-600">
            Deux univers, une seule plateforme. Choisissez votre version.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {/* Hôtel */}
          <div className="bg-white rounded-3xl shadow-lg p-8 border-2 border-slate-100 hover:border-blue-200 transition">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: `${BLUE}15` }}>
              <Hotel className="w-7 h-7" style={{ color: BLUE }} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Version Hôtel</h2>
            <p className="text-slate-600 mb-6">
              Pour les petits hôtels, boutique hôtels et hôtels indépendants.
            </p>
            <ul className="space-y-2 mb-6">
              {['Demandes de services (ménage, serviettes, maintenance)', 'Room service avec menu digital', 'Réservation spa avec calendrier', 'Bouton SOS avec GPS temps réel', 'Gestion des avis (anti-bad review)', 'Consigne bagages & mode dernier jour', 'Bracelet personne (sécurité enfant/senior)', 'Push notifications staff', 'Dashboard temps réel'].map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                  <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: BLUE }} /> {f}
                </li>
              ))}
            </ul>
            <Link href="/fonctionnalites/hotel" className="inline-flex items-center gap-2 text-sm font-bold" style={{ color: BLUE }}>
              Voir les détails <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Airbnb */}
          <div className="bg-white rounded-3xl shadow-lg p-8 border-2 border-slate-100 hover:border-emerald-200 transition">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: `${EMERALD}15` }}>
              <Home className="w-7 h-7" style={{ color: EMERALD }} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Version Airbnb & Conciergerie</h2>
            <p className="text-slate-600 mb-6">
              Pour les propriétaires Airbnb et les conciergeries multi-logements.
            </p>
            <ul className="space-y-2 mb-6">
              {['Guide maison digital (Wi-Fi, électroménager, règles)', 'Check-in / Check-out automatisés', 'Codes Wi-Fi centralisés', 'Contact concierge (bouton alerte)', 'Tourisme local géolocalisé', 'Bouton retour à l\'appartement', 'Modes d\'emploi appareils (Nespresso, Bosch…)', 'Gestion multi-logements', 'Duplication de configuration en 1 clic'].map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                  <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: EMERALD }} /> {f}
                </li>
              ))}
            </ul>
            <Link href="/fonctionnalites/airbnb" className="inline-flex items-center gap-2 text-sm font-bold" style={{ color: EMERALD }}>
              Voir les détails <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-3xl p-8 text-center" style={{ background: `linear-gradient(135deg, ${EMERALD}, ${BLUE})` }}>
          <h2 className="text-2xl font-bold text-white mb-4">Une question ?</h2>
          <p className="text-blue-50 mb-6">Demandez une démo personnalisée de la version qui vous intéresse.</p>
          <a href="/demande-demo" className="inline-flex items-center gap-2 px-8 py-3 bg-white rounded-xl font-bold text-slate-900">
            Demander une démo <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </div>
    </div>
  );
}
