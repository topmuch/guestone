/**
 * Seed démo Guest One — crée l'agence démo + un bracelet + un séjour
 * Lance: node scripts/seed-demo.cjs
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seed démo Guest One...');

  // 1. Crée ou récupère l'agence démo
  let agency = await prisma.agency.findUnique({
    where: { slug: 'demo-guest-one' },
  });

  if (!agency) {
    agency = await prisma.agency.create({
      data: {
        name: 'Hôtel Démo Guest One',
        slug: 'demo-guest-one',
        email: 'demo@guestone.pro',
        phone: '+221 77 000 00 00',
        contactPhone: '+221 77 000 00 00',
        address: 'Dakar, Sénégal',
        agencyType: 'hotel',
        braceletProfile: 'STANDARD',
        latitude: 14.6928,
        longitude: -17.4467,
        active: true,
      },
    });
    console.log('✅ Agence démo créée:', agency.id);
  } else {
    console.log('ℹ️ Agence démo existe déjà');
  }

  // 2. Crée ou récupère le bracelet démo (Baggage avec context WRISTBAND)
  let bracelet = await prisma.baggage.findFirst({
    where: { agencyId: agency.id, reference: 'DEMO-QRCODE' },
  });

  if (!bracelet) {
    bracelet = await prisma.baggage.create({
      data: {
        reference: 'DEMO-QRCODE',
        agencyId: agency.id,
        type: 'wristband',
        context: 'WRISTBAND',
        status: 'active',
        travelerFirstName: 'Client',
        travelerLastName: 'Démo',
      },
    });
    console.log('✅ Bracelet démo créé:', bracelet.id);
  } else {
    console.log('ℹ️ Bracelet démo existe déjà');
  }

  // 3. Crée un séjour démo
  const existingStay = await prisma.stay.findFirst({
    where: { baggageId: bracelet.id, status: 'active' },
  });

  if (!existingStay) {
    await prisma.stay.create({
      data: {
        agencyId: agency.id,
        baggageId: bracelet.id,
        roomNumber: '101',
        guestName: 'Client Démo',
        guestEmail: 'demo@guestone.pro',
        guestPhone: '+221 77 000 00 00',
        language: 'fr',
        checkInDate: new Date(),
        checkOutDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        nbPersons: 2,
        status: 'active',
      },
    });
    console.log('✅ Séjour démo créé');
  } else {
    console.log('ℹ️ Séjour démo existe déjà');
  }

  // 4. Crée quelques services démo (si pas déjà présents)
  const existingServices = await prisma.hotelService.count({
    where: { agencyId: agency.id },
  });

  if (existingServices === 0) {
    const services = [
      { name: 'Serviettes supplémentaires', icon: '🧖', category: 'housekeeping', type: 'request', tab: 'hotel', team: 'housekeeping', free: true, price: 0, desc: 'Demandez des serviettes propres' },
      { name: 'Ménage chambre', icon: '🧹', category: 'housekeeping', type: 'request', tab: 'hotel', team: 'housekeeping', free: true, price: 0, desc: 'Service de ménage programmé' },
      { name: 'Réception', icon: '🛎️', category: 'reception', type: 'info', tab: 'hotel', team: 'reception', free: true, price: 0, desc: 'Contactez la réception' },
      { name: 'Retour à l\'hôtel', icon: '📍', category: 'reception', type: 'info', tab: 'help', team: 'reception', free: true, price: 0, desc: 'Itinéraire Google Maps' },
    ];

    for (const s of services) {
      await prisma.hotelService.create({
        data: {
          agencyId: agency.id,
          name: s.name,
          description: s.desc,
          icon: s.icon,
          type: s.type,
          category: s.category,
          isFree: s.free,
          price: s.price,
          assignedTeam: s.team,
          displayTab: s.tab,
          isActive: true,
        },
      });
    }
    console.log('✅ 4 services démo créés');
  } else {
    console.log('ℹ️ Services démo existent déjà');
  }

  console.log('\n🎉 Démo prête !');
  console.log('   URL: /welcome/demo-guest-one?context=WRISTBAND&lang=fr&ref=DEMO-QRCODE');
}

main().catch((e) => { console.error('❌', e); }).finally(() => prisma.$disconnect());
