'use client';

import Link from 'next/link';
import { Hotel, Home, ArrowRight } from 'lucide-react';

const EMERALD = '#10B981';
const BLUE = '#2563EB';

const FEATURES = [
  { slug: 'demandes-services', title: 'Demandes de services', desc: 'Ménage, serviettes, repassage, assistance technique.', image: '/images/features/demandes-services.png' },
  { slug: 'room-service', title: 'Room service & commandes', desc: 'Menu digital, panier, suivi en temps réel. Facturation chambre.', image: '/images/features/room-service.png' },
  { slug: 'spa', title: 'Réservation spa', desc: 'Calendrier interactif, créneaux, tarifs. Confirmation instantanée.', image: '/images/features/spa.png' },
  { slug: 'guide-maison-airbnb', title: 'Guide maison Airbnb', desc: 'Check-in, check-out, Wi-Fi, règles. Tout centralisé.', image: '/images/features/guide-maison.png' },
  { slug: 'tourisme', title: 'Tourisme local géolocalisé', desc: 'Recommandations à proximité. Tri par distance GPS.', image: '/images/features/tourisme.png' },
  { slug: 'retour-hotel', title: 'Retour à l\'hôtel', desc: 'Bouton "Retour" avec itinéraire Google Maps.', image: '/images/features/retour-hotel.png' },
  { slug: 'sos', title: 'Assistance / SOS', desc: 'Bouton SOS avec partage GPS temps réel.', image: '/images/features/sos.png' },
  { slug: 'avis', title: 'Gestion des avis', desc: 'Anti-bad review : interceptez avant Google.', image: '/images/features/avis.png' },
  { slug: 'consigne', title: 'Consigne & dernier jour', desc: 'Dépôt bagages, douche, transfert aéroport.', image: '/images/features/consigne.png' },
];

export default function FonctionnalitesPage() {
  return (
    <div className="min-h-screen pt-20" style={{ background: 'linear-gradient(135deg, #ECFDF5 0%, #F8FAFC 50%, #EFF6FF 100%)' }}>
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
            Tout ce dont vos clients ont besoin
          </h1>
          <p className="text-lg text-slate-600">
            9 modules prêts à l'emploi, activables selon vos besoins. Cliquez pour en savoir plus.
          </p>
        </div>

        {/* Features grid with real images */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {FEATURES.map((f, i) => (
            <Link
              key={i}
              href={`/fonctionnalites/${f.slug}`}
              className="group bg-white rounded-3xl overflow-hidden border border-slate-100 hover:shadow-xl transition-all"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <div className="aspect-[4/3] overflow-hidden">
                <img src={f.image} alt={f.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="p-5">
                <h3 className="font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-600 mb-3">{f.desc}</p>
                <span className="inline-flex items-center gap-1 text-sm font-bold group-hover:gap-2 transition-all" style={{ color: BLUE }}>
                  En savoir plus <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Hôtel vs Airbnb */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Link href="/fonctionnalites/hotel" className="group bg-white rounded-3xl shadow-lg p-8 border-2 border-slate-100 hover:border-blue-200 transition">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: `${BLUE}15` }}>
              <Hotel className="w-7 h-7" style={{ color: BLUE }} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Version Hôtel</h2>
            <p className="text-slate-600 mb-6">Pour les petits hôtels et boutique hôtels.</p>
            <span className="inline-flex items-center gap-1 text-sm font-bold group-hover:gap-2 transition-all" style={{ color: BLUE }}>
              Voir les détails <ArrowRight className="w-4 h-4" />
            </span>
          </Link>

          <Link href="/fonctionnalites/airbnb" className="group bg-white rounded-3xl shadow-lg p-8 border-2 border-slate-100 hover:border-emerald-200 transition">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: `${EMERALD}15` }}>
              <Home className="w-7 h-7" style={{ color: EMERALD }} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Version Airbnb & Conciergerie</h2>
            <p className="text-slate-600 mb-6">Pour les propriétaires et conciergeries multi-logements.</p>
            <span className="inline-flex items-center gap-1 text-sm font-bold group-hover:gap-2 transition-all" style={{ color: EMERALD }}>
              Voir les détails <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        </div>

        {/* CTA */}
        <div className="rounded-3xl p-8 text-center" style={{ background: `linear-gradient(135deg, ${EMERALD}, ${BLUE})` }}>
          <h2 className="text-2xl font-bold text-white mb-4">Une question ?</h2>
          <p className="text-blue-50 mb-6">Demandez une démo personnalisée.</p>
          <Link href="/demande-demo" className="inline-flex items-center gap-2 px-8 py-3 bg-white rounded-xl font-bold text-slate-900">
            Demander une démo <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
