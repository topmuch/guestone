import { NextRequest, NextResponse } from 'next/server';
import { sendPushToAgency } from '@/lib/push';

/**
 * POST /api/push/send — superadmin ou interne envoie une notif à une agence
 * Body: { agencyId, title, body, url? }
 * Utilisé par les crons (escalade) et les webhooks (nouvelle commande)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { agencyId, title, body: message, url, tag } = body;

    if (!agencyId || !title || !message) {
      return NextResponse.json({ error: 'agencyId, title, body requis' }, { status: 400 });
    }

    const sent = await sendPushToAgency(agencyId, {
      title,
      body: message,
      url,
      tag: tag || 'guestone',
      icon: '/icon-192x192.png',
    });

    return NextResponse.json({ success: true, sent });
  } catch (error) {
    console.error('[api/push/send] Error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
