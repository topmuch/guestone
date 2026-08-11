import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/rgpd/export?agencyId=xxx ou ?userId=xxx
 *
 * V3: Export complet des données d'un tenant ou utilisateur (RGPD)
 * Retourne un JSON avec toutes les données personnelles stockées.
 */
export async function GET(req: NextRequest) {
  try {
    const { getSession } = await import('@/lib/session');
    const user = await getSession();
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const agencyId = searchParams.get('agencyId');
    const userId = searchParams.get('userId');

    // Un user ne peut exporter que ses propres données ou celles de son agence
    // Le superadmin peut tout exporter
    const isSuperadmin = user.role === 'superadmin';
    if (userId && userId !== user.id && !isSuperadmin) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }
    if (agencyId && agencyId !== user.agencyId && !isSuperadmin) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const exportData: Record<string, unknown> = {
      exportDate: new Date().toISOString(),
      exportedBy: user.email,
    };

    // Export par userId
    if (userId) {
      exportData.user = await db.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, name: true, role: true, createdAt: true, agencyId: true },
      });
      exportData.sessions = await db.session.findMany({ where: { userId } });
      exportData.loginLogs = await db.loginLog.findMany({ where: { userId } });
      exportData.pushSubscriptions = await db.pushSubscription.findMany({ where: { userId } });
    }

    // Export par agencyId
    if (agencyId) {
      exportData.agency = await db.agency.findUnique({ where: { id: agencyId } });
      exportData.users = await db.user.findMany({
        where: { agencyId },
        select: { id: true, email: true, name: true, role: true, createdAt: true },
      });
      exportData.stays = await db.stay.findMany({ where: { agencyId } });
      exportData.serviceRequests = await db.serviceRequest.findMany({
        where: { agencyId },
        include: { service: { select: { name: true } } },
      });
      exportData.feedbacks = await db.feedback.findMany({ where: { agencyId } });
      exportData.complaints = await db.complaint.findMany({ where: { agencyId } });
      exportData.sosAlerts = await db.sosAlert.findMany({ where: { agencyId } });
      exportData.orders = await db.order.findMany({ where: { agencyId }, include: { items: true } });
      exportData.lastDayRequests = await db.lastDayRequest.findMany({ where: { agencyId } });
      exportData.spaAppointments = await db.spaAppointment.findMany({ where: { agencyId } });
      exportData.marketplaceOrders = await db.marketplaceOrder.findMany({
        where: { agencyId },
        include: { items: true },
      });
      exportData.lostItems = await db.lostItem.findMany({ where: { agencyId } });
      exportData.personBracelets = await db.personBracelet.findMany({ where: { agencyId } });
      exportData.messages = await db.message.findMany({ where: { agencyId } });
    }

    // Log de l'export (RGPD: tracer les accès)
    await db.systemLog.create({
      data: {
        level: 'info',
        message: `RGPD export by ${user.email} (agencyId: ${agencyId || 'N/A'}, userId: ${userId || 'N/A'})`,
        source: 'api/rgpd/export',
        metadata: JSON.stringify({ agencyId, userId, exportedBy: user.id }),
      },
    });

    return NextResponse.json(exportData);
  } catch (error) {
    console.error('[api/rgpd/export] Error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
