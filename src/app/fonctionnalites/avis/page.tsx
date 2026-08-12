'use client';

import FeaturePage from '../FeaturePage';

export default function Page() {
  return (
    <FeaturePage
      image="/images/features/avis.png"
      title="Gestion des avis"
      subtitle="Anti-bad review, interceptez avant Google"
      description="Note avant départ : 4-5★ → redirection Google/TripAdvisor. 1-3★ → formulaire privé + ticket manager. Interceptez les réclamations avant qu'elles soient publiques. Protégez votre réputation."
      color="#2563EB"
      features={[{"title": "Note avant départ", "desc": "Le client est invité à noter son séjour avant le check-out. Une note simple en 1 tap : 1 à 5 étoiles."}, {"title": "Routing intelligent", "desc": "Note 4-5★ : redirection vers Google, TripAdvisor, Booking ou Airbnb. Le client laisse un avis public positif."}, {"title": "Formulaire privé", "desc": "Note 1-3★ : formulaire privé avec catégorie (propreté, bruit, service, confort, facturation) et description. Le manager reçoit un ticket."}, {"title": "Dashboard manager", "desc": "Toutes les réclamations sont centralisées. Statut : ouverte → en cours → résolue. Bouton 'Marquer résolu' avec note de résolution."}, {"title": "Statistiques", "desc": "Note moyenne, taux de réclamations, taux de résolution. Identifiez les problèmes récurrents."}]}     testimonials={[{"name": "Sophie Martin", "role": "Gérante, Villa Téranga", "text": "Le module anti-bad review a sauvé notre réputation. 90% des problèmes sont résolus avant le départ."}, {"name": "Aminata Diallo", "role": "Directrice, Hôtel Baobab", "text": "On a intercepté 12 mauvais avis en 3 mois. Tous sont devenus des avis positifs après résolution."}]}   />
  );
}
