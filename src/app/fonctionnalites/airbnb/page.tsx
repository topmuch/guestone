'use client';

import { Home, Wifi, MapPin, Bell, BookOpen, Check, ArrowRight, TrendingUp, Clock, Building2 } from 'lucide-react';

const EMERALD = '#10B981';
const BLUE = '#2563EB';

export default function AirbnbFeaturesPage() {
  const features = [
    { icon: BookOpen, title: 'Guide maison digital', desc: 'Wi-Fi, électroménager, règles de la maison, check-in/check-out. Tout est centralisé dans un livret digital accessible par QR code. Plus besoin d\'envoyer des PDFs ou des messages à chaque arrivée.', color: EMERALD },
    { icon: Wifi, title: 'Codes Wi-Fi centralisés', desc: 'Le voyageur scanne le QR code et voit immédiatement le réseau Wi-Fi et le mot de passe. Bouton copier en 1 tap. Plus jamais de message "quel est le code Wi-Fi ?".', color: BLUE },
    { icon: MapPin, title: 'Tourisme local géolocalisé', desc: 'Recommandations automatiques autour du logement : restaurants, activités, transports. Tri par distance GPS. Bouton "Itinéraire" Google Maps en 1 tap.', color: EMERALD },
    { icon: Bell, title: 'Alerte conciergerie', desc: 'Bouton d\'urgence dédié Airbnb. Le voyageur envoie un message + option partage GPS. La conciergerie est notifiée par email immédiatement.', color: BLUE },
    { icon: Home, title: 'Bouton retour appartement', desc: 'Le voyageur est perdu ? Un bouton "Retour à l\'appartement" ouvre Google Maps avec l\'itinéraire depuis sa position actuelle.', color: EMERALD },
    { icon: BookOpen, title: 'Modes d\'emploi appareils', desc: 'Référentiel de 16 modèles d\'appareils (Nespresso, Bosch, Samsung TV, Daikin, jacuzzi, BBQ…). Photo, vidéo YouTube, étapes et dépannage pré-remplis. Bouton "Ma photo" pour personnaliser.', color: BLUE },
  ];

  const benefits = [
    { icon: Clock, title: '-80% de temps', desc: 'Sur la gestion des arrivées' },
    { icon: TrendingUp, title: '+45% satisfaction', desc: 'Voyageurs mieux informés' },
    { icon: Building2, title: 'Multi-logements', desc: 'Gérez tous vos Airbnb' },
    { icon: Home, title: 'Image premium', desc: 'Un Airbnb connecté se démarque' },
  ];

  return (
    <div className="min-h-screen pt-20" style={{ background: 'linear-gradient(135deg, #ECFDF5 0%, #F8FAFC 100%)' }}>
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4" style={{ backgroundColor: `${EMERALD}15` }}>
            <Home className="w-4 h-4" style={{ color: EMERALD }} />
            <span className="text-sm font-semibold" style={{ color: EMERALD }}>Version Airbnb & Conciergerie</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
            Le guide digital parfait pour vos voyageurs
          </h1>
          <p className="text-lg text-slate-600">
            6 modules pour simplifier la gestion de vos logements Airbnb.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {benefits.map((b, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 text-center border border-slate-100">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: `${EMERALD}15` }}>
                <b.icon className="w-6 h-6" style={{ color: EMERALD }} />
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

        {/* Multi-logements */}
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-16 border-2" style={{ borderColor: `${EMERALD}30` }}>
          <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Building2 className="w-6 h-6" style={{ color: EMERALD }} /> Gérez plusieurs logements
          </h2>
          <p className="text-slate-600 mb-4">
            Vous gérez plusieurs Airbnb ? Guest One vous permet de tout piloter depuis un seul compte. Dupliquez la configuration d'un logement vers un autre en 1 clic.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {['Dashboard multi-logements', 'Duplication de configuration en 1 clic', 'Statistiques consolidées', 'Bascule rapide entre logements', 'Gestion des équipes par logement', 'QR codes uniques par logement'].map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-slate-700">
                <Check className="w-4 h-4" style={{ color: EMERALD }} /> {f}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-3xl p-8 text-center" style={{ background: `linear-gradient(135deg, ${EMERALD}, ${BLUE})` }}>
          <h2 className="text-2xl font-bold text-white mb-4">Prêt à digitaliser vos Airbnb ?</h2>
          <a href="/demande-demo" className="inline-flex items-center gap-2 px-8 py-3 bg-white rounded-xl font-bold text-slate-900">
            Demander une démo <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </div>
    </div>
  );
}
