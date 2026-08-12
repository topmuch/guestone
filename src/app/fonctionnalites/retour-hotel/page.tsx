'use client';

import FeaturePage from '../FeaturePage';

export default function Page() {
  return (
    <FeaturePage
      image="/images/features/retour-hotel.png"
      title="Retour à l'hôtel"
      subtitle="Itinéraire Google Maps"
      description="Le client est perdu ? Un bouton 'Retour à l'hôtel' ouvre Google Maps avec l'itinéraire depuis sa position actuelle. Plus jamais de client égaré, plus jamais d'appel paniqué."
      color="#2563EB"
      features={[{"title": "Bouton toujours visible", "desc": "Dans l'onglet 'Aide', un gros bouton 'Retour à l'hôtel' est toujours accessible, même sans connexion."}, {"title": "Itinéraire automatique", "desc": "Google Maps s'ouvre avec l'itinéraire depuis la position GPS actuelle du client vers l'hôtel."}, {"title": "Fonctionne hors ligne", "desc": "L'adresse de l'hôtel est stockée localement. Même sans réseau, le client peut voir l'adresse et appeler un taxi."}, {"title": "Version Airbnb", "desc": "Pour les Airbnb, le bouton devient 'Retour à l'appartement' avec l'adresse du logement."}, {"title": "Appel direct", "desc": "Bouton 'Appeler la réception' (ou le concierge) en 1 tap, directement depuis l'onglet Aide."}]}     testimonials={[{"name": "Awa Cissé", "role": "Réceptionniste, Hôtel Saly", "text": "On a divisé par 3 les appels de clients perdus. Le bouton retour à l'hôtel est génial."}]}   />
  );
}
