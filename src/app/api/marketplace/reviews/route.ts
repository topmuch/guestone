import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/marketplace/reviews — laisser un avis sur un commerçant
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { merchantId, agencyId, guestName, rating, comment } = body;

    if (!merchantId || !agencyId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'merchantId, agencyId et rating (1-5) requis' }, { status: 400 });
    }

    const review = await db.merchantReview.create({
      data: {
        merchantId,
        agencyId,
        guestName: guestName || null,
        rating,
        comment: comment || null,
      },
    });

    return NextResponse.json({ success: true, review });
  } catch (error) {
    console.error('[api/marketplace/reviews POST] Error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// GET /api/marketplace/reviews?merchantId=xxx — avis d'un commerçant
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const merchantId = searchParams.get('merchantId');

  if (!merchantId) return NextResponse.json({ error: 'merchantId requis' }, { status: 400 });

  const reviews = await db.merchantReview.findMany({
    where: { merchantId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  const avgRating = reviews.length > 0
    ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
    : null;

  return NextResponse.json({ success: true, reviews, avgRating, total: reviews.length });
}
