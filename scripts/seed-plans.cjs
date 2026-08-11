/**
 * Seed plans Guest One — version CJS (Docker-friendly)
 * Lance: node scripts/seed-plans.cjs
 *
 * 3 plans: Starter, Pro, Premium (PRD §12.6)
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const PLANS = [
  {
    name: 'Starter',
    description: 'Pour petits hôtels et Airbnb débutants',
    priceMonthly: 15000,
    priceYearly: 150000,
    maxProperties: 1,
    maxQRCodes: 30,
    maxUsers: 2,
    includedModules: JSON.stringify([
      'core_access', 'qr_bracelet', 'notifications',
      'aide_contact', 'retour_hotel', 'demandes_service',
      'anti_bad_review', 'check_in_out', 'objets_trouves',
      'guide_maison', 'wifi', 'contact_concierge', 'retour_appartement',
    ]),
    badge: '🚀',
    isPopular: false,
    isActive: true,
    sortOrder: 1,
  },
  {
    name: 'Pro',
    description: 'Pour hôtels moyens et conciergeries multi-logements',
    priceMonthly: 35000,
    priceYearly: 350000,
    maxProperties: 5,
    maxQRCodes: 200,
    maxUsers: 8,
    includedModules: JSON.stringify([
      'core_access', 'qr_bracelet', 'notifications', 'analytics',
      'aide_contact', 'retour_hotel', 'demandes_service',
      'room_service', 'anti_bad_review', 'consigne_dernier_jour',
      'check_in_out', 'modeles_appareils', 'objets_trouves', 'bracelet_personne',
      'guide_maison', 'wifi', 'contact_concierge', 'tourisme_geo',
      'retour_appartement', 'urgence_concierge', 'escalade_auto',
    ]),
    badge: '⭐',
    isPopular: true,
    isActive: true,
    sortOrder: 2,
  },
  {
    name: 'Premium',
    description: 'Pour grands hôtels, resorts et conciergeries premium',
    priceMonthly: 75000,
    priceYearly: 750000,
    maxProperties: 20,
    maxQRCodes: 1000,
    maxUsers: 50,
    includedModules: null, // null = tous les modules
    badge: '💎',
    isPopular: false,
    isActive: true,
    sortOrder: 3,
  },
];

async function main() {
  console.log('🌱 Seeding ' + PLANS.length + ' plans...');
  await prisma.plan.deleteMany({});
  for (const p of PLANS) {
    await prisma.plan.create({ data: p });
  }
  console.log('✅ ' + PLANS.length + ' plans créés');
}

main().catch((e) => { console.error('❌', e); }).finally(() => prisma.$disconnect());
