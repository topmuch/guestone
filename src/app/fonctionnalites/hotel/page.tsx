'use client';

import { Bell, ShoppingCart, Sparkles, LifeBuoy, Star, Luggage, Check, ArrowRight, Hotel, Users, TrendingUp, Shield } from 'lucide-react';

const BLUE = '#2563EB';
const EMERALD = '#10B981';

export default function HotelFeaturesPage() {
  const features = [
    { icon: Bell, title: 'Demandes de services', desc: 'Ménage, serviettes, repassage, maintenance. Le client demande en 1 tap, le staff est notifié par email et push. Statuts en temps réel : nouvelle → en cours → traitée.', color: BLUE },
    { icon: ShoppingCart, title: 'Room service', desc: 'Menu digital avec photos et prix. Panier, suivi de commande (pending → confirmed → preparing → ready → delivered). Facturation sur la chambre.', color: EMERALD },
    { icon: Sparkles, title: 'Réservation spa', desc: 'Calendrier interactif avec créneaux de 30 min. Vérification automatique des chevauchements. Email de confirmation au client et au spa.', color: BLUE },
    { icon: LifeBuoy, title: 'SOS avancé', desc: 'Bouton à maintenir 3 secondes. Partage GPS en temps réel (toutes les 30s). Dashboard staff avec carte, historique des positions et boutons d\'action.', color: EMERALD },
    { icon: Star, title: 'Anti-bad review', desc: 'Note avant départ : 4-5★ → redirection Google/TripAdvisor. 1-3★ → formulaire privé + ticket manager. Interceptez les réclamations avant qu\'elles soient publiques.', color: BLUE },
    { icon: Luggage, title: 'Mode dernier jour', desc: 'Après check-out : dépôt bagages avec code de retrait, réservation douche, transfert aéroport. Email automatique à la réception.', color: EMERALD },
  ];

  const benefits = [
    { icon: TrendingUp, title: '+30% de revenus', desc: 'Room service, spa, boutique locale' },
    { icon: Users, title: '-60% d\'appels', desc: 'Les demandes passent par la WebApp' },
    { icon: Shield, title: 'Réputation protégée', desc: 'Interceptez les mauvais avis' },
    { icon: Hotel, title: 'Image premium', desc: 'Un établissement connecté attire' },
  ];

  return (
    <div className="min-h-screen pt-20" style={{ background: 'linear-gradient(135deg, #EFF6FF 0%, #F8FAFC 100%)' }}>
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4" style={{ backgroundColor: `${BLUE}15` }}>
            <Hotel className="w-4 h-4" style={{ color: BLUE }} />
            <span className="text-sm font-semibold" style={{ color: BLUE }}>Version Hôtel</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
            Tout ce dont votre hôtel a besoin
          </h1>
          <p className="text-lg text-slate-600">
            6 modules puissants pour transformer l'expérience de vos clients.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {benefits.map((b, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 text-center border border-slate-100">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: `${BLUE}15` }}>
                <b.icon className="w-6 h-6" style={{ color: BLUE }} />
              </div>
              <p className="text-xl font-bold text-slate-900">{b.title}</p>
              <p className="text-xs text-slate-500 mt-1">{b.desc}</p>
            </div>
          ))}
        </div>

        {/* Features détaillées */}
        <div className="space-y-6 mb-16">
          {features.map((f, i) => (
            <div key={i} className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col md:flex-row gap-6 items-start">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${f.color}15` }}>
                <f.icon className="w-7 h-7" style={{ color: f.color }} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="rounded-3xl p-8 text-center" style={{ background: `linear-gradient(135deg, ${BLUE}, ${EMERALD})` }}>
          <h2 className="text-2xl font-bold text-white mb-4">Prêt à moderniser votre hôtel ?</h2>
          <a href="/demande-demo" className="inline-flex items-center gap-2 px-8 py-3 bg-white rounded-xl font-bold text-slate-900">
            Demander une démo <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </div>
    </div>
  );
}
