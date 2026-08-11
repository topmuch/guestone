import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * POST /api/sos-alert/ping
 * Body: { alertId, latitude, longitude, accuracy?, speed?, heading? }
 *
 * Le client envoie sa position toutes les 30s tant que l'alerte est active.
 * Met à jour la position actuelle de l'alerte + crée un ping historique.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { alertId, latitude, longitude, accuracy, speed, heading } = body;

    if (!alertId || latitude === undefined || longitude === undefined) {
      return NextResponse.json({ error: 'alertId, latitude, longitude requis' }, { status: 400 });
    }

    // Vérifie que l'alerte est encore active
    const alert = await db.sosAlert.findUnique({ where: { id: alertId } });
    if (!alert) return NextResponse.json({ error: 'Alerte introuvable' }, { status: 404 });
    if (alert.status === 'resolved' || alert.status === 'false_alarm') {
      return NextResponse.json({ success: true, message: 'Alerte résolue — tracking arrêté' });
    }

    // Crée le ping + met à jour la position actuelle
    const [ping] = await Promise.all([
      db.sosLocationPing.create({
        data: {
          sosAlertId: alertId,
          latitude,
          longitude,
          accuracy: accuracy || null,
          speed: speed || null,
          heading: heading || null,
        },
      }),
      db.sosAlert.update({
        where: { id: alertId },
        data: { latitude, longitude },
      }),
    ]);

    return NextResponse.json({ success: true, pingId: ping.id });
  } catch (error) {
    console.error('[api/sos-alert/ping] Error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

/**
 * GET /api/sos-alert/ping?alertId=xxx — récupère l'historique des pings
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const alertId = searchParams.get('alertId');
  if (!alertId) return NextResponse.json({ error: 'alertId requis' }, { status: 400 });

  const pings = await db.sosLocationPing.findMany({
    where: { sosAlertId: alertId },
    orderBy: { createdAt: 'desc' },
    take: 100, // 100 derniers pings (~50 min de tracking)
  });

  return NextResponse.json({ success: true, pings });
}
