'use client';

import FeaturePage from '../FeaturePage';

export default function Page() {
  return (
    <FeaturePage
      image="/images/features/consigne.png"
      title="Consigne & dernier jour"
      subtitle="Bagages, douche, transfert"
      description="Après check-out : dépôt bagages avec code de retrait, réservation douche, transfert aéroport. Le client profite de sa dernière journée sans contraintes. Email automatique à la réception."
      color="#10B981"
      features={[{"title": "Dépôt bagages", "desc": "Le client dépose ses bagages à la réception. Un code de retrait unique est généré (6 caractères). Il récupère ses bagages plus tard avec ce code."}, {"title": "Réservation douche", "desc": "Le client réserve un créneau douche avant son départ. Indique l'heure et la durée souhaitée."}, {"title": "Transfert aéroport", "desc": "Le client réserve un transfert vers l'aéroport ou la gare. Indique destination, heure de vol, nombre de passagers."}, {"title": "Code de retrait sécurisé", "desc": "Le code de retrait bagages est unique et sécurisé. Présenté à la réception pour récupérer les bagages."}, {"title": "Email automatique", "desc": "La réception reçoit un email avec le type de demande, les détails et le code de retrait le cas échéant."}]}     testimonials={[{"name": "Omar Sow", "role": "Manager, Hôtel Teranga", "text": "Le mode dernier jour a amélioré notre satisfaction client. Les clients partent en excursion sans leurs bagages."}]}   />
  );
}
