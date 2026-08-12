'use client';

import FeaturePage from '../FeaturePage';

export default function Page() {
  return (
    <FeaturePage
      image="/images/features/tourisme.png"
      title="Tourisme local géolocalisé"
      subtitle="Recommandations à proximité"
      description="Le client voit les lieux recommandés autour de l'hôtel, triés par distance GPS. Restaurants, activités, transports. Bouton 'Itinéraire' Google Maps en 1 tap."
      color="#2563EB"
      features={[{"title": "POI automatiques", "desc": "Le système importe automatiquement les points d'intérêt autour de l'hôtel (restaurants, musées, plages, commerces) via OpenStreetMap."}, {"title": "Tri par distance", "desc": "Les lieux sont triés par distance GPS depuis la position du client. Les plus proches en premier."}, {"title": "Bouton itinéraire", "desc": "En 1 tap, Google Maps s'ouvre avec l'itinéraire vers le lieu choisi. Plus jamais de client perdu."}, {"title": "Partenaires locaux", "desc": "Référencez vos partenaires (restaurants, excursionnistes) avec note, commission et code promo."}, {"title": "Géofencing intelligent", "desc": "L'onglet 'Autour de moi' s'active automatiquement quand le client sort de l'hôtel."}]}     testimonials={[{"name": "Mamadou Diop", "role": "Directeur, Hôtel Le Baobab", "text": "Les clients adorent découvrir les environs sans avoir à demander. Ça améliore leur expérience."}]}   />
  );
}
