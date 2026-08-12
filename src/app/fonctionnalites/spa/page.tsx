'use client';

import FeaturePage from '../FeaturePage';

export default function Page() {
  return (
    <FeaturePage
      image="/images/features/spa.png"
      title="Réservation spa"
      subtitle="Calendrier, créneaux, tarifs"
      description="Le client réserve un soin en voyant le calendrier et les prix. Vérification automatique des chevauchements. Confirmation instantanée par email. Maximisez vos revenus spa."
      color="#10B981"
      features={[{"title": "Liste des soins", "desc": "Le client voit tous les soins disponibles avec description, durée, prix et praticien."}, {"title": "Calendrier interactif", "desc": "Sélection de la date et du créneau (tranches de 30 min, de 9h à 19h). Les créneaux déjà réservés sont masqués."}, {"title": "Vérification anti-chevauchement", "desc": "Le système vérifie automatiquement qu'il n'y a pas de conflit avec un autre rendez-vous."}, {"title": "Confirmation email", "desc": "Le client et le spa reçoivent un email de confirmation avec tous les détails du rendez-vous."}, {"title": "Gestion des statuts", "desc": "Dashboard staff : en attente → confirmé → terminé / annulé / no-show. Gestion simple et claire."}]}     testimonials={[{"name": "Karim Benali", "role": "Concierge, Saly Properties", "text": "Le spa booking a transformé notre service. Les clients réservent eux-mêmes, sans appeler la réception."}]}   />
  );
}
