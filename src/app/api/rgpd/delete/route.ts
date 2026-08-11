import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * DELETE /api/rgpd/delete?agencyId=xxx ou ?userId=xxx
 *
 * V3: Suppression complète des données (RGPD droit à l'oubli)
 *
 * - Anonymise les données personnelles (nom, email, téléphone → "[deleted]")
 * - Garde les enregistrements pour audit (mais sans données perso)
 * - Supprime vraiment les sessions, pushSubscriptions, messages
 */
export async function DELETE(req: NextRequest) {
  try {
    const { getSession } = await import('@/lib/session');
    const user = await getSession();
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const agencyId = searchParams.get('agencyId');
    const userId = searchParams.get('userId');

    const isSuperadmin = user.role === 'superadmin';
    if (userId && userId !== user.id && !isSuperadmin) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }
    if (agencyId && agencyId !== user.agencyId && !isSuperadmin) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    // Confirmation requise
    const confirmHeader = req.headers.get('x-confirm');
    if (confirmHeader !== 'DELETE-MY-DATA') {
      return NextResponse.json({
        error: 'Confirmation requise',
        message: 'Ajoutez le header x-confirm: DELETE-MY-DATA pour confirmer la suppression définitive',
      }, { status: 400 });
    }

    let deleted: Record<string, number> = {};

    // Suppression par userId
    if (userId) {
      deleted.sessions = await db.session.deleteMany({ where: { userId } });
      deleted.pushSubscriptions = await db.pushSubscription.deleteMany({ where: { userId } });
      deleted.loginLogs = await db.loginLog.deleteMany({ where: { userId } });

      // Anonymise l'utilisateur
      await db.user.update({
        where: { id: userId },
        data: {
          email: `deleted-${userId.substring(0, 8)}@rgpd.local`,
          name: '[Deleted]',
          password: null,
        },
      });
    }

    // Suppression par agencyId
    if (agencyId) {
      // Anonymise les stays
      deleted.stays = (await db.stay.updateMany({
        where: { agencyId },
        data: {
          guestName: '[Deleted]',
          guestEmail: null,
          guestPhone: null,
          status: 'cancelled',
        },
      })).count;

      // Anonymise les service requests
      deleted.serviceRequests = (await db.serviceRequest.updateMany({
        where: { agencyId },
        data: { guestName: '[Deleted]', guestPhone: null },
      })).count;

      // Anonymise les feedbacks
      deleted.feedbacks = (await db.feedback.updateMany({
        where: { agencyId },
        data: { comment: '[Deleted]' },
      })).count;

      // Anonymise les SOS alerts
      deleted.sosAlerts = (await db.sosAlert.updateMany({
        where: { agencyId },
        data: { guestName: '[Deleted]', guestPhone: null, message: '[Deleted]' },
      })).count;

      // Anonymise les orders
      deleted.orders = (await db.order.updateMany({
        where: { agencyId },
        data: { guestName: '[Deleted]', guestPhone: null },
      })).count;

      // Anonymise les marketplace orders
      deleted.marketplaceOrders = (await db.marketplaceOrder.updateMany({
        where: { agencyId },
        data: { guestName: '[Deleted]', guestPhone: null },
      })).count;

      // Anonymise les lost items
      deleted.lostItems = (await db.lostItem.updateMany({
        where: { agencyId },
        data: { claimedBy: null },
      })).count;

      // Anonymise les person bracelets
      deleted.personBracelets = (await db.personBracelet.updateMany({
        where: { agencyId },
        data: {
          description: '[Deleted]',
          medicalInfo: null,
          allergies: null,
          emergencyContacts: null,
        },
      })).count;

      // Supprime les messages (vraie suppression)
      deleted.messages = await db.message.deleteMany({ where: { agencyId } });
    }

    // Log de la suppression (RGPD: tracer)
    await db.systemLog.create({
      data: {
        level: 'warn',
        message: `RGPD deletion by ${user.email} (agencyId: ${agencyId || 'N/A'}, userId: ${userId || 'N/A'})`,
        source: 'api/rgpd/delete',
        metadata: JSON.stringify({ agencyId, userId, deleted, by: user.id }),
      },
    });

    return NextResponse.json({ success: true, deleted });
  } catch (error) {
    console.error('[api/rgpd/delete] Error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
