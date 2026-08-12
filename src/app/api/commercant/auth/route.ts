import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';

/**
 * POST /api/commercant/auth
 * Body: { accessCode }
 * Login simplifié commerçant via accessCode
 * Retourne un token signé + merchant info
 *
 * V3 SECURITY FIX: Le token est persisté en DB (hash SHA-256) avec expiration.
 * Le token ne peut plus être forgé car on vérifie le hash côté serveur.
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

    // Génère un token sécurisé (64 chars hex)
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    // Persiste le hash du token en DB (pas le token en clair)
    await db.merchant.update({
      where: { id: merchant.id },
      data: {
        activeTokenHash: tokenHash,
        tokenExpiresAt: expiresAt,
      },
    });

    return NextResponse.json({
      success: true,
      token,
      expiresAt: expiresAt.toISOString(),
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
