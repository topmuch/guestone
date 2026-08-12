'use client';

import FeaturePage from '../FeaturePage';

export default function Page() {
  return (
    <FeaturePage
      image="/images/features/demandes-services.png"
      title="Demandes de services"
      subtitle="Ménage, serviettes, maintenance"
      description="Le client demande en 1 tap, le staff est notifié par email et push. Statuts en temps réel : nouvelle → en cours → traitée. Fini les appels à la réception pour tout et n'importe quoi."
      color="#10B981"
      features={[{"title": "1 tap pour demander", "desc": "Le client ouvre la WebApp, sélectionne le service (serviettes, ménage, repassage, maintenance), et valide. C'est envoyé."}, {"title": "Notification automatique", "desc": "L'équipe concernée (ménage, maintenance, cuisine) reçoit un email avec le détail de la demande et un lien direct vers le dashboard."}, {"title": "Suivi en temps réel", "desc": "Le client voit le statut de sa demande : nouvelle → en cours → traitée. Il sait exactement où ça en est."}, {"title": "Escalade automatique", "desc": "Si une demande n'est pas traitée après 15 minutes (configurable), le manager est alerté par email."}, {"title": "Historique complet", "desc": "Toutes les demandes sont archivées. Vous pouvez analyser les tendances et optimiser vos équipes."}]}     testimonials={[{"name": "Aminata Diallo", "role": "Directrice, Hôtel Baobab", "text": "Les demandes de serviettes arrivent directement sur le téléphone du staff. Plus d'appels à la réception, plus de confusion."}, {"name": "Omar Sow", "role": "Manager, Hôtel Teranga", "text": "Le suivi en temps réel a transformé notre rapport aux clients. Ils savent quand leur demande est traitée."}]}   />
  );
}
