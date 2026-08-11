import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';

/**
 * POST /api/commercant/auth
 * Body: { accessCode }
 * Login simplifié commerçant via accessCode
 * Retourne un token + merchant info
 */
export async function POST(req: NextRequest) {
  try {
    const { accessCode } = await req.json();
    if (!accessCode) return NextResponse.json({ error: 'Code requis' }, { status: 400 });

    const merchant = await db.merchant.findFirst({
      where: { accessCode, isActive: true },
      include: { agency: { select: { name: true, slug: true } } },
    });

    if (!merchant) {
      return NextResponse.json({ error: 'Code invalide ou commerçant désactivé' }, { status: 404 });
    }

    // Génère un token session simple (valide 24h)
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    return NextResponse.json({
      success: true,
      token,
      expiresAt,
      merchant: {
        id: merchant.id,
        name: merchant.name,
        category: merchant.category,
        commissionRate: merchant.commissionRate,
        agencyName: merchant.agency.name,
      },
    });
  } catch (error) {
    console.error('[api/commercant/auth] Error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
