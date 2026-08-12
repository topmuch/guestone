'use client';

import FeaturePage from '../FeaturePage';

export default function Page() {
  return (
    <FeaturePage
      image="/images/features/room-service.png"
      title="Room service & commandes"
      subtitle="Menu digital, panier, suivi"
      description="Le client consulte le menu, ajoute au panier, commande. Le cuisine reçoit la commande, la prépare, la livre. Facturation sur la chambre. Une nouvelle source de revenus sans effort."
      color="#2563EB"
      features={[{"title": "Menu digital avec photos", "desc": "Le client voit le menu complet avec photos, descriptions et prix. Catégories : petit-déj, plats, desserts, boissons, snacks."}, {"title": "Panier et commande", "desc": "Le client ajoute des articles au panier, ajuste les quantités, ajoute des notes (allergies, préférences) et valide."}, {"title": "Suivi temps réel", "desc": "Le client suit sa commande : en attente → confirmée → en préparation → prête → livrée. Notification à chaque étape."}, {"title": "Facturation sur la chambre", "desc": "Pas de paiement en ligne compliqué. La commande est facturée sur la chambre, réglée au départ."}, {"title": "Email automatique cuisine", "desc": "La cuisine reçoit un email avec le détail de la commande, la chambre et les notes du client."}]}     testimonials={[{"name": "Sophie Martin", "role": "Gérante, Villa Téranga", "text": "Le room service a augmenté nos revenus de 25%. Les clients commandent plus quand c'est aussi simple."}]}   />
  );
}
