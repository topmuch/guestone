import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * POST /api/demo/reset
 * Réinitialise la démo toutes les heures (cron appelé par instrumentation)
 * Supprime toutes les données de l'agence démo et recrée des données d'exemple
 */
export async function POST() {
  try {
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = process.env.DEMO_RESET_TOKEN || 'demo-reset-internal';
    if (!cronSecret) {
      return NextResponse.json({ error: 'CRON_SECRET non configuré' }, { status: 500 });
    }

    // Cherche l'agence démo
    const demoAgency = await db.agency.findFirst({
      where: { slug: 'demo-guest-one' },
    });

    if (!demoAgency) {
      return NextResponse.json({ success: true, message: 'Pas d\'agence démo' });
    }

    // Supprime toutes les données de l'agence démo
    await Promise.all([
      db.serviceRequest.deleteMany({ where: { agencyId: demoAgency.id } }),
      db.feedback.deleteMany({ where: { agencyId: demoAgency.id } }),
      db.sosAlert.deleteMany({ where: { agencyId: demoAgency.id } }),
      db.order.deleteMany({ where: { agencyId: demoAgency.id } }),
      db.lastDayRequest.deleteMany({ where: { agencyId: demoAgency.id } }),
      db.spaAppointment.deleteMany({ where: { agencyId: demoAgency.id } }),
      db.marketplaceOrder.deleteMany({ where: { agencyId: demoAgency.id } }),
      db.stay.deleteMany({ where: { agencyId: demoAgency.id } }),
    ]);

    // Recrée un séjour démo
    const demoBracelet = await db.baggage.findFirst({
      where: { agencyId: demoAgency.id, context: 'WRISTBAND' },
    });

    if (demoBracelet) {
      await db.stay.create({
        data: {
          agencyId: demoAgency.id,
          baggageId: demoBracelet.id,
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
    }

    // Log
    await db.systemLog.create({
      data: {
        level: 'info',
        message: 'Demo reset — données réinitialisées',
        source: 'api/demo/reset',
      },
    });

    return NextResponse.json({ success: true, resetAt: new Date().toISOString() });
  } catch (error) {
    console.error('[api/demo/reset] Error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
