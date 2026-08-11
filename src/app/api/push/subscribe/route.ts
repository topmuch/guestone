import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { subscribeUser, getVapidPublicKey } from '@/lib/push';

/**
 * GET /api/push/subscribe — retourne la clé publique VAPID
 */
export async function GET() {
  return NextResponse.json({ success: true, publicKey: getVapidPublicKey() });
}

/**
 * POST /api/push/subscribe — enregistre un abonnement push
 * Body: { subscription: { endpoint, keys: { p256dh, auth } } }
 */
export async function POST(req: NextRequest) {
  try {
    const { getSession } = await import('@/lib/session');
    const user = await getSession();
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const body = await req.json();
    const { subscription } = body;
    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return NextResponse.json({ error: 'Subscription invalide' }, { status: 400 });
    }

    const userAgent = req.headers.get('user-agent') || undefined;
    await subscribeUser(user.id, user.agencyId || null, subscription, userAgent);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[api/push/subscribe POST] Error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

/**
 * DELETE /api/push/subscribe — désabonne
 * Body: { endpoint }
 */
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { endpoint } = body;
    if (!endpoint) return NextResponse.json({ error: 'endpoint requis' }, { status: 400 });

    await db.pushSubscription.deleteMany({ where: { endpoint } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[api/push/subscribe DELETE] Error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
