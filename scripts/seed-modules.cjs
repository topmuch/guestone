/**
 * Seed catalogue modules Guest One — version CJS (Docker-friendly)
 * Lance: node scripts/seed-modules.cjs
 *
 * Basé sur PRD §10 — Modules fonctionnels
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const MODULES = [
  // ─── CORE (obligatoires) ───
  {
    key: 'core_access', name: 'Core Access', description: 'Accès WebApp via QR code',
    category: 'core', icon: '🌐', defaultEnabled: true, isRequired: true, priority: 1, phase: 'mvp',
  },
  {
    key: 'qr_bracelet', name: 'QR / Bracelet', description: 'Gestion des QR codes et bracelets',
    category: 'core', icon: '⌚', defaultEnabled: true, isRequired: true, priority: 2, phase: 'mvp',
  },
  {
    key: 'notifications', name: 'Notifications', description: 'Alertes et rappels par email',
    category: 'core', icon: '🔔', defaultEnabled: true, isRequired: false, priority: 3, phase: 'mvp',
  },
  {
    key: 'analytics', name: 'Analytics', description: 'Statistiques de base',
    category: 'core', icon: '📊', defaultEnabled: true, isRequired: false, priority: 4, phase: 'mvp',
  },

  // ─── HÔTEL ───
  {
    key: 'aide_contact', name: 'Aide & Contact', description: 'Numéro réception, WhatsApp, FAQ',
    category: 'hotel', icon: '🛎️', defaultEnabled: true, isRequired: false, priority: 10, phase: 'mvp',
  },
  {
    key: 'retour_hotel', name: 'Retour Navigation', description: 'Retour hôtel via Google Maps',
    category: 'hotel', icon: '📍', defaultEnabled: true, isRequired: false, priority: 11, phase: 'mvp',
  },
  {
    key: 'demandes_service', name: 'Demandes Service', description: 'Serviettes, ménage, repassage, problèmes techniques',
    category: 'hotel', icon: '📨', defaultEnabled: true, isRequired: false, priority: 12, phase: 'mvp',
  },
  {
    key: 'room_service', name: 'Room Service', description: 'Commande menu en chambre',
    category: 'hotel', icon: '🍽️', defaultEnabled: false, isRequired: false, priority: 13, phase: 'v2',
  },
  {
    key: 'spa_booking', name: 'Spa Booking', description: 'Réservation spa avec calendrier',
    category: 'hotel', icon: '💆', defaultEnabled: false, isRequired: false, priority: 14, phase: 'v2',
    dependencies: 'calendar',
  },
  {
    key: 'marketplace', name: 'Marketplace Locale', description: 'Produits locaux, commerçants partenaires',
    category: 'hotel', icon: '🛍️', defaultEnabled: false, isRequired: false, priority: 15, phase: 'v2',
  },
  {
    key: 'sos_alerte', name: 'SOS Alerte', description: 'Alerte urgence GPS (maintenir 3s + incident)',
    category: 'hotel', icon: '🆘', defaultEnabled: false, isRequired: false, priority: 16, phase: 'v2',
    dependencies: 'aide_contact',
  },
  {
    key: 'anti_bad_review', name: 'Anti-Bad Review', description: 'Note 4-5 → Google ; Note 1-3 → formulaire privé',
    category: 'hotel', icon: '⭐', defaultEnabled: true, isRequired: false, priority: 17, phase: 'mvp',
  },
  {
    key: 'consigne_dernier_jour', name: 'Consigne Dernier Jour', description: 'Bagages, douche, transfert après check-out',
    category: 'hotel', icon: '🧳', defaultEnabled: false, isRequired: false, priority: 18, phase: 'v2',
  },
  {
    key: 'check_in_out', name: 'Check-in / Check-out', description: 'Arrivée/départ, self check-in',
    category: 'hotel', icon: '🔑', defaultEnabled: true, isRequired: false, priority: 19, phase: 'mvp',
  },
  {
    key: 'modeles_appareils', name: 'Modes d\'emploi appareils', description: 'Référentiel appareils (Nespresso, Bosch, TV…)',
    category: 'hotel', icon: '📖', defaultEnabled: true, isRequired: false, priority: 20, phase: 'mvp',
  },
  {
    key: 'objets_trouves', name: 'Objets Trouvés', description: 'Inventaire objets trouvés + restitution',
    category: 'hotel', icon: '🔍', defaultEnabled: true, isRequired: false, priority: 21, phase: 'mvp',
  },
  {
    key: 'bracelet_personne', name: 'Bracelet Personne', description: 'Sécurité enfant/senior (alerte position)',
    category: 'hotel', icon: '👶', defaultEnabled: false, isRequired: false, priority: 22, phase: 'mvp',
  },
  {
    key: 'pms_integration', name: 'Intégration PMS', description: 'Cloudbeds, Mews, Sirvoy',
    category: 'hotel', icon: '🔌', defaultEnabled: false, isRequired: false, priority: 23, phase: 'v3',
  },

  // ─── AIRBNB / CONCIERGERIE ───
  {
    key: 'guide_maison', name: 'Guide Maison', description: 'Livret numérique Airbnb (Wi-Fi, électroménager, règles)',
    category: 'airbnb', icon: '🏠', defaultEnabled: true, isRequired: false, priority: 30, phase: 'mvp',
  },
  {
    key: 'wifi', name: 'Wi-Fi', description: 'Affichage code Wi-Fi + bouton copier',
    category: 'airbnb', icon: '📶', defaultEnabled: true, isRequired: false, priority: 31, phase: 'mvp',
  },
  {
    key: 'contact_concierge', name: 'Contact Concierge', description: 'Appel, WhatsApp, email concierge',
    category: 'airbnb', icon: '🤝', defaultEnabled: true, isRequired: false, priority: 32, phase: 'mvp',
  },
  {
    key: 'tourisme_geo', name: 'Tourisme Géolocalisé', description: 'Lieux recommandés autour du logement',
    category: 'airbnb', icon: '🗺️', defaultEnabled: true, isRequired: false, priority: 33, phase: 'v2',
  },
  {
    key: 'retour_appartement', name: 'Retour Appartement', description: 'Retour logement via Google Maps',
    category: 'airbnb', icon: '📍', defaultEnabled: true, isRequired: false, priority: 34, phase: 'mvp',
  },
  {
    key: 'urgence_concierge', name: 'Urgence Concierge', description: 'Bouton urgence Airbnb (alerte conciergerie)',
    category: 'airbnb', icon: '🚨', defaultEnabled: false, isRequired: false, priority: 35, phase: 'v2',
    dependencies: 'contact_concierge',
  },

  // ─── BUSINESS / PREMIUM ───
  {
    key: 'paiements', name: 'Paiements', description: 'Paiement en ligne (Stripe, etc.)',
    category: 'business', icon: '💳', defaultEnabled: false, isRequired: false, priority: 40, phase: 'v2',
  },
  {
    key: 'commissions', name: 'Commissions', description: 'Suivi revenus marketplace',
    category: 'business', icon: '💰', defaultEnabled: false, isRequired: false, priority: 41, phase: 'v3',
    dependencies: 'marketplace',
  },
  {
    key: 'audit_logs', name: 'Audit Logs', description: 'Journal complet des actions',
    category: 'business', icon: '📜', defaultEnabled: false, isRequired: false, priority: 42, phase: 'v2',
  },
  {
    key: 'escalade_auto', name: 'Escalade Auto', description: 'Email direction si demande non traitée > X min',
    category: 'business', icon: '⚠️', defaultEnabled: true, isRequired: false, priority: 43, phase: 'mvp',
  },
];

async function main() {
  console.log('🌱 Seeding ' + MODULES.length + ' modules Guest One...');
  await prisma.module.deleteMany({});
  for (const m of MODULES) {
    await prisma.module.create({ data: m });
  }
  console.log('✅ ' + MODULES.length + ' modules créés');
}

main().catch((e) => { console.error('❌', e); }).finally(() => prisma.$disconnect());
