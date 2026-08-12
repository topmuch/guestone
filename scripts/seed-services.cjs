/**
 * Seed catalogue de services Guest One — version CJS
 * 45 services concrets et pratiques + horaires
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const SERVICES = [
  // ─── MÉNAGE & LINGE (housekeeping) ───
  { name: 'Serviettes propres', icon: '🧖', cat: 'housekeeping', type: 'request', tab: 'hotel', team: 'housekeeping', free: true, price: 0, desc: 'Demander des serviettes propres supplémentaires', pack: 'resort', schedule: '{"days":"mon-sun","open":"07:00","close":"22:00"}' },
  { name: 'Draps propres', icon: '🛏️', cat: 'housekeeping', type: 'request', tab: 'hotel', team: 'housekeeping', free: true, price: 0, desc: 'Changer les draps du lit', pack: 'urban', schedule: '{"days":"mon-sun","open":"07:00","close":"22:00"}' },
  { name: 'Oreiller supplémentaire', icon: '😴', cat: 'housekeeping', type: 'request', tab: 'hotel', team: 'housekeeping', free: true, price: 0, desc: 'Demander un oreiller supplémentaire', pack: 'urban' },
  { name: 'Ménage chambre', icon: '🧹', cat: 'housekeeping', type: 'request', tab: 'hotel', team: 'housekeeping', free: true, price: 0, desc: 'Service de ménage programmé', pack: 'urban', schedule: '{"days":"mon-sun","open":"08:00","close":"18:00"}' },
  { name: 'Produits d\'accueil', icon: '🧴', cat: 'housekeeping', type: 'request', tab: 'hotel', team: 'housekeeping', free: true, price: 0, desc: 'Savon, shampoing, gel douche', pack: 'resort' },
  { name: 'Blanchisserie', icon: '👔', cat: 'housekeeping', type: 'request', tab: 'hotel', team: 'housekeeping', free: false, price: 5000, desc: 'Lavage et repassage (24h)', pack: 'resort', schedule: '{"days":"mon-sat","open":"08:00","close":"18:00"}' },
  { name: 'Pressing express', icon: '👗', cat: 'housekeeping', type: 'request', tab: 'hotel', team: 'housekeeping', free: false, price: 8000, desc: 'Pressing en 4h', pack: 'urban', schedule: '{"days":"mon-sat","open":"08:00","close":"18:00"}' },

  // ─── MAINTENANCE ───
  { name: 'Problème technique', icon: '🔧', cat: 'maintenance', type: 'request', tab: 'hotel', team: 'maintenance', free: true, price: 0, desc: 'Signaler une panne (clim, TV, plomberie, électricité)', pack: 'urban', schedule: '{"days":"mon-sun","open":"00:00","close":"23:59"}' },
  { name: 'Climatisation', icon: '❄️', cat: 'maintenance', type: 'request', tab: 'hotel', team: 'maintenance', free: true, price: 0, desc: 'Réglage ou panne climatisation', pack: 'urban' },
  { name: 'Wi-Fi assistance', icon: '📶', cat: 'maintenance', type: 'info', tab: 'hotel', team: 'maintenance', free: true, price: 0, desc: 'Code Wi-Fi et assistance connexion', pack: 'urban' },
  { name: 'TV / Box', icon: '📺', cat: 'maintenance', type: 'request', tab: 'hotel', team: 'maintenance', free: true, price: 0, desc: 'Problème TV, chaînes, box', pack: 'urban' },

  // ─── RESTAURATION ───
  { name: 'Room Service', icon: '🍽️', cat: 'food', type: 'order', tab: 'hotel', team: 'kitchen', free: false, price: 0, desc: 'Commandez en chambre (menu disponible)', pack: 'resort', schedule: '{"days":"mon-sun","open":"06:30","close":"22:00"}' },
  { name: 'Petit-déjeuner en chambre', icon: '🥐', cat: 'food', type: 'order', tab: 'hotel', team: 'kitchen', free: false, price: 7500, desc: 'Petit-déj livré en chambre (6h30-10h)', pack: 'resort', schedule: '{"days":"mon-sun","open":"06:30","close":"10:00"}' },
  { name: 'Réservation restaurant', icon: '🍴', cat: 'food', type: 'booking', tab: 'hotel', team: 'reception', free: true, price: 0, desc: 'Réservez une table au restaurant de l\'hôtel', pack: 'urban' },
  { name: 'Bar / Lounge', icon: '🍸', cat: 'food', type: 'info', tab: 'hotel', team: 'reception', free: true, price: 0, desc: 'Horaires et menu du bar', pack: 'resort', schedule: '{"days":"mon-sun","open":"17:00","close":"01:00"}' },

  // ─── SPA & BIEN-ÊTRE ───
  { name: 'Réservation Spa', icon: '💆', cat: 'spa', type: 'booking', tab: 'hotel', team: 'spa', free: false, price: 25000, desc: 'Soins et massages (sur réservation)', pack: 'resort', schedule: '{"days":"mon-sun","open":"09:00","close":"19:00"}' },
  { name: 'Massage en chambre', icon: '🧘', cat: 'spa', type: 'booking', tab: 'hotel', team: 'spa', free: false, price: 35000, desc: 'Massage dans votre chambre', pack: 'resort' },
  { name: 'Salle de sport', icon: '🏋️', cat: 'spa', type: 'info', tab: 'hotel', team: 'reception', free: true, price: 0, desc: 'Horaires gym (6h-22h)', pack: 'urban', schedule: '{"days":"mon-sun","open":"06:00","close":"22:00"}' },
  { name: 'Piscine', icon: '🏊', cat: 'spa', type: 'info', tab: 'hotel', team: 'reception', free: true, price: 0, desc: 'Horaires piscine (8h-20h)', pack: 'resort', schedule: '{"days":"mon-sun","open":"08:00","close":"20:00"}' },

  // ─── RÉCEPTION & SERVICES ───
  { name: 'Réveil', icon: '⏰', cat: 'reception', type: 'request', tab: 'hotel', team: 'reception', free: true, price: 0, desc: 'Demandez un réveil téléphonique', pack: 'urban' },
  { name: 'Navette aéroport', icon: '🚐', cat: 'transport', type: 'booking', tab: 'hotel', team: 'reception', free: false, price: 15000, desc: 'Navette vers l\'aéroport (sur réservation)', pack: 'urban' },
  { name: 'Taxi', icon: '🚖', cat: 'transport', type: 'booking', tab: 'hotel', team: 'reception', free: true, price: 0, desc: 'Appelez un taxi', pack: 'urban' },
  { name: 'Location voiture', icon: '🚗', cat: 'transport', type: 'booking', tab: 'hotel', team: 'reception', free: false, price: 25000, desc: 'Location voiture (partenaire)', pack: 'resort' },
  { name: 'Change / Bureau de change', icon: '💱', cat: 'reception', type: 'info', tab: 'hotel', team: 'reception', free: true, price: 0, desc: 'Taux de change et horaires', pack: 'urban' },
  { name: 'Conciergerie', icon: '🛎️', cat: 'reception', type: 'info', tab: 'hotel', team: 'reception', free: true, price: 0, desc: 'Conseils, réservations, infos pratiques', pack: 'resort' },
  { name: 'Bagagerie', icon: '🧳', cat: 'reception', type: 'request', tab: 'hotel', team: 'reception', free: true, price: 0, desc: 'Déposez vos bagages à la réception', pack: 'urban' },

  // ─── CHECK-IN / CHECK-OUT ───
  { name: 'Check-out express', icon: '🏃', cat: 'reception', type: 'request', tab: 'hotel', team: 'reception', free: true, price: 0, desc: 'Départ rapide sans file d\'attente', pack: 'urban' },
  { name: 'Late check-out', icon: '🕙', cat: 'reception', type: 'request', tab: 'hotel', team: 'reception', free: false, price: 2500, desc: 'Départ tardif (jusqu\'à 14h)', pack: 'urban' },
  { name: 'Early check-in', icon: '🏃', cat: 'reception', type: 'request', tab: 'hotel', team: 'reception', free: false, price: 2500, desc: 'Arrivée anticipée (dès 11h)', pack: 'urban' },

  // ─── DERNIER JOUR ───
  { name: 'Dépôt bagages', icon: '🧳', cat: 'reception', type: 'request', tab: 'hotel', team: 'reception', free: true, price: 0, desc: 'Déposez vos bagages après check-out', pack: 'urban' },
  { name: 'Transfert aéroport', icon: '🚐', cat: 'transport', type: 'booking', tab: 'hotel', team: 'reception', free: false, price: 20000, desc: 'Transfert privé aéroport', pack: 'urban' },

  // ─── INFOS PRATIQUES ───
  { name: 'Horaires petit-déjeuner', icon: '🥣', cat: 'reception', type: 'info', tab: 'hotel', team: 'reception', free: true, price: 0, desc: '7h00 - 10h00', pack: 'urban', schedule: '{"days":"mon-sun","open":"07:00","close":"10:00"}' },
  { name: 'Horaires réception', icon: '🕒', cat: 'reception', type: 'info', tab: 'hotel', team: 'reception', free: true, price: 0, desc: '24h/24', pack: 'urban', schedule: '{"days":"mon-sun","open":"00:00","close":"23:59"}' },
  { name: 'Règlement intérieur', icon: '📋', cat: 'reception', type: 'info', tab: 'hotel', team: 'reception', free: true, price: 0, desc: 'Règles de l\'établissement', pack: 'urban' },

  // ─── TOURISME ───
  { name: 'Excursions', icon: '🚌', cat: 'transport', type: 'booking', tab: 'tourism', team: 'reception', free: false, price: 20000, desc: 'Excursions et visites guidées', pack: 'resort' },
  { name: 'Activités locales', icon: '🎯', cat: 'transport', type: 'booking', tab: 'tourism', team: 'reception', free: false, price: 15000, desc: 'Sports, loisirs, culture', pack: 'resort' },

  // ─── AIDE ───
  { name: 'Retour à l\'hôtel', icon: '📍', cat: 'reception', type: 'info', tab: 'help', team: 'reception', free: true, price: 0, desc: 'Itinéraire Google Maps vers l\'hôtel', pack: 'urban' },
  { name: 'Urgences', icon: '🚑', cat: 'reception', type: 'info', tab: 'help', team: 'reception', free: true, price: 0, desc: 'Numéros d\'urgence locaux', pack: 'urban' },
  { name: 'Je suis perdu', icon: '🆘', cat: 'reception', type: 'request', tab: 'help', team: 'reception', free: true, price: 0, desc: 'Envoyez votre position à la réception', pack: 'urban' },

  // ─── AIRBNB SPÉCIFIQUE ───
  { name: 'Guide maison', icon: '🏠', cat: 'reception', type: 'info', tab: 'hotel', team: 'reception', free: true, price: 0, desc: 'Wi-Fi, électroménager, règles', pack: 'bnb' },
  { name: 'Wi-Fi', icon: '📶', cat: 'maintenance', type: 'info', tab: 'hotel', team: 'reception', free: true, price: 0, desc: 'Code Wi-Fi du logement', pack: 'bnb' },
  { name: 'Contact concierge', icon: '🤝', cat: 'reception', type: 'info', tab: 'help', team: 'reception', free: true, price: 0, desc: 'Appeler le concierge', pack: 'bnb' },
  { name: 'Retour appartement', icon: '📍', cat: 'reception', type: 'info', tab: 'help', team: 'reception', free: true, price: 0, desc: 'Itinéraire vers le logement', pack: 'bnb' },
];

async function main() {
  console.log('🌱 Seeding ' + SERVICES.length + ' service templates...');
  await prisma.serviceTemplate.deleteMany({ where: { agencyId: null } });
  for (const s of SERVICES) {
    await prisma.serviceTemplate.create({
      data: {
        name: s.name, nameEn: s.name, nameEs: s.name,
        description: s.desc, descriptionEn: s.desc, descriptionEs: s.desc,
        icon: s.icon, type: s.type, category: s.cat,
        displayTab: s.tab, assignedTeam: s.team,
        isFree: s.free, defaultPrice: s.price,
        defaultSchedule: s.schedule || null,
        pack: s.pack, isActive: true,
      },
    });
  }
  console.log('✅ ' + SERVICES.length + ' services créés');
}

main().catch((e) => { console.error('❌', e); }).finally(() => prisma.$disconnect());
