import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/marketplace?agencyId=xxx&lat=...&lng=... — liste commerçants enrichis
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const agencyId = searchParams.get('agencyId');
  const guestLat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : null;
  const guestLng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : null;

  if (!agencyId) return NextResponse.json({ error: 'agencyId requis' }, { status: 400 });

  const merchants = await db.merchant.findMany({
    where: { agencyId, isActive: true },
    include: {
      products: {
        where: { isAvailable: true },
        orderBy: { name: 'asc' },
      },
      reviews: {
        select: { rating: true, comment: true, guestName: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      _count: {
        select: { reviews: true },
      },
    },
    orderBy: [{ isVerified: 'desc' }, { name: 'asc' }],
  });

  // Enrichir avec distance GPS + rating moyen
  const enriched = merchants.map((m) => {
    const avgRating = m.reviews.length > 0
      ? Math.round((m.reviews.reduce((sum, r) => sum + r.rating, 0) / m.reviews.length) * 10) / 10
      : null;

    let distanceKm: number | null = null;
    if (guestLat !== null && guestLng !== null && m.latitude !== null && m.longitude !== null) {
      const R = 6371;
      const dLat = (guestLat - m.latitude!) * Math.PI / 180;
      const dLng = (guestLng - m.longitude!) * Math.PI / 180;
      const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(m.latitude! * Math.PI / 180) * Math.cos(guestLat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
      distanceKm = Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
    }

    return {
      id: m.id,
      name: m.name,
      description: m.description,
      category: m.category,
      // Coordonnées
      address: m.address,
      phone: m.phone,
      whatsapp: m.whatsapp,
      email: m.email,
      website: m.website,
      // Médias
      logoUrl: m.logoUrl,
      coverUrl: m.coverUrl,
      // Géolocalisation
      latitude: m.latitude,
      longitude: m.longitude,
      distanceKm,
      // Statut
      isVerified: m.isVerified,
      isActive: m.isActive,
      commissionRate: m.commissionRate,
      // Rating
      avgRating,
      totalReviews: m._count.reviews,
      recentReviews: m.reviews.slice(0, 3),
      // Produits
      products: m.products,
    };
  });

  // Trier par distance si GPS dispo, sinon par vérifié puis nom
  if (guestLat !== null && guestLng !== null) {
    enriched.sort((a, b) => {
      if (a.distanceKm !== null && b.distanceKm !== null) return a.distanceKm - b.distanceKm;
      if (a.distanceKm !== null) return -1;
      if (b.distanceKm !== null) return 1;
      return 0;
    });
  }

  return NextResponse.json({ success: true, merchants: enriched });
}
