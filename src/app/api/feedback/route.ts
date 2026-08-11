import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * POST /api/feedback — client soumet une note
 * Body: { agencyId, baggageId?, rating (1-5), comment? }
 *
 * Logique PRD §14.10:
 *   rating >= 4 → routing = "public_redirect", retourne plateformes publiques
 *   rating <= 3 → routing = "private_complaint", créer Complaint (sera rempli après)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { agencyId, baggageId, rating, comment } = body;

    if (!agencyId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'agencyId et rating (1-5) requis' }, { status: 400 });
    }

    // Récupère les infos client depuis Stay si baggageId fourni
    let guestName: string | null = null;
    let roomNumber: string | null = null;
    if (baggageId) {
      const stay = await db.stay.findFirst({
        where: { baggageId, status: 'active' },
        select: { guestName: true, roomNumber: true },
      });
      if (stay) {
        guestName = stay.guestName;
        roomNumber = stay.roomNumber;
      }
    }

    const routing = rating >= 4 ? 'public_redirect' : 'private_complaint';

    const feedback = await db.feedback.create({
      data: {
        agencyId,
        baggageId: baggageId || null,
        rating,
        comment: comment || null,
        routing,
      },
    });

    // Si note basse, créer une complaint ouverte (le client remplira après)
    if (routing === 'private_complaint') {
      // Le client sera redirigé vers le formulaire, la complaint sera créée
      // avec les détails quand il soumettra le formulaire
      return NextResponse.json({
        success: true,
        feedbackId: feedback.id,
        routing,
        redirect: 'complaint_form',
      });
    }

    // Note haute → retourner les plateformes publiques configurées par l'agence
    // TODO: configurable par tenant; pour l'instant on retourne Google par défaut
    const agency = await db.agency.findUnique({
      where: { id: agencyId },
      select: { name: true, address: true },
    });
    const googleSearchUrl = agency?.address
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(agency.name + ' ' + agency.address)}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(agency.name || '')}`;

    return NextResponse.json({
      success: true,
      feedbackId: feedback.id,
      routing,
      redirect: 'public_review',
      platforms: {
        google: googleSearchUrl,
        tripadvisor: `https://www.tripadvisor.com/Search?q=${encodeURIComponent(agency.name || '')}`,
        booking: 'https://www.booking.com/',
        airbnb: 'https://www.airbnb.com/',
      },
    });
  } catch (error) {
    console.error('[api/feedback POST] Error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

/**
 * GET /api/feedback?agencyId=xxx — dashboard manager
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const agencyId = searchParams.get('agencyId');
  if (!agencyId) return NextResponse.json({ error: 'agencyId requis' }, { status: 400 });

  const feedbacks = await db.feedback.findMany({
    where: { agencyId },
    include: { complaint: true, baggage: { select: { reference: true } } },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return NextResponse.json({ success: true, feedbacks });
}
