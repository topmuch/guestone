import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';

/**
 * V3 SECURITY FIX: Vérifie le token commerçant contre le hash stocké en DB.
 */
async function getMerchantFromToken(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.substring(7);
  if (!token || token.length < 32) return null;

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const merchant = await db.merchant.findFirst({
    where: {
      activeTokenHash: tokenHash,
      isActive: true,
      tokenExpiresAt: { gt: new Date() },
    },
    select: { id: true, name: true, agencyId: true },
  });

  return merchant;
}

/**
 * GET /api/commercant/orders — liste les commandes du commerçant
 */
export async function GET(req: NextRequest) {
  const merchant = await getMerchantFromToken(req);
  if (!merchant) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const orders = await db.marketplaceOrder.findMany({
    where: { merchantId: merchant.id },
    include: { items: true },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === 'pending').length,
    delivered: orders.filter((o) => o.status === 'delivered').length,
    revenue: orders.filter((o) => o.status === 'delivered').reduce((s, o) => s + o.merchantAmount, 0),
  };

  return NextResponse.json({ success: true, orders, stats });
}

/**
 * PATCH /api/commercant/orders?id=xxx&status=xxx
 */
export async function PATCH(req: NextRequest) {
  const merchant = await getMerchantFromToken(req);
  if (!merchant) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const status = searchParams.get('status');

  if (!id || !status) return NextResponse.json({ error: 'id et status requis' }, { status: 400 });

  const order = await db.marketplaceOrder.findUnique({ where: { id } });
  if (!order || order.merchantId !== merchant.id) {
    return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });
  }

  const updated = await db.marketplaceOrder.update({
    where: { id },
    data: { status, handledBy: merchant.name },
  });

  return NextResponse.json({ success: true, order: updated });
}
