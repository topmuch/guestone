'use client';

import FeaturePage from '../FeaturePage';

export default function Page() {
  return (
    <FeaturePage
      image="/images/features/sos.png"
      title="Assistance / SOS"
      subtitle="GPS temps réel, suivi incident"
      description="Bouton à maintenir 3 secondes. Partage GPS en temps réel (toutes les 30s). Dashboard staff avec carte, historique des positions et boutons d'action. La sécurité de vos clients, partout."
      color="#10B981"
      features={[{"title": "Maintenir 3 secondes", "desc": "Le bouton SOS doit être maintenu 3 secondes pour éviter les fausses alertes. Anneau de progression visuel."}, {"title": "GPS temps réel", "desc": "Après déclenchement, la position du client est envoyée toutes les 30 secondes. Le staff voit où il est en temps réel."}, {"title": "Dashboard staff", "desc": "Alerte visuelle pulsante. Carte avec position Google Maps. Boutons : Vu, En cours, Résolu, Fausse alerte."}, {"title": "Historique GPS", "desc": "Tous les pings GPS sont archivés. Vous pouvez voir le trajet complet du client pendant l'incident."}, {"title": "Email automatique", "desc": "La réception et le management reçoivent un email avec les infos client, la position et un lien vers le dashboard."}, {"title": "Version concierge Airbnb", "desc": "Pour les Airbnb : bouton 'Alerter la conciergerie' (ambre, sans maintenir 3s). Message + option partage GPS."}]}     testimonials={[{"name": "Cheikh Fall", "role": "Directeur sécurité, Hôtel Plateau", "text": "Le SOS GPS temps réel a sauvé un client perdu en ville. On l'a retrouvé en 10 minutes."}]}   />
  );
}
