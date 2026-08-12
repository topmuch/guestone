'use client';

import FeaturePage from '../FeaturePage';

export default function Page() {
  return (
    <FeaturePage
      image="/images/features/guide-maison.png"
      title="Guide maison Airbnb"
      subtitle="Wi-Fi, électroménager, règles"
      description="Tout est centralisé dans un livret digital accessible par QR code. Wi-Fi, électroménager, check-in/out, règles. Plus besoin d'envoyer des PDFs ou des messages à chaque arrivée."
      color="#10B981"
      features={[{"title": "Livret digital complet", "desc": "Wi-Fi, machine à café, TV, lave-linge, chauffage, clim, poubelles, parking, règles de la maison. Tout au même endroit."}, {"title": "Modes d'emploi appareils", "desc": "Référentiel de 16 modèles (Nespresso, Bosch, Samsung TV, Daikin, jacuzzi, BBQ…). Photo, vidéo YouTube, étapes, dépannage pré-remplis."}, {"title": "Bouton 'Ma photo'", "desc": "Remplacez la photo officielle par celle de l'appareil réel du logement. Personnalisation en 1 clic."}, {"title": "Check-in / Check-out", "desc": "Instructions d'arrivée et de départ. Code d'accès, contact concierge, itinéraire. Le voyageur est autonome."}, {"title": "Multilingue", "desc": "Le guide s'affiche dans la langue du voyageur (FR, EN, ES). Plus de barrière linguistique."}]}     testimonials={[{"name": "Fatou Ndiaye", "role": "Propriétaire Airbnb, Dakar", "text": "Mes voyageurs trouvent tout seuls. Je ne reçois plus de messages à 23h pour le code Wi-Fi."}]}   />
  );
}
