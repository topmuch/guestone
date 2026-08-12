import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';

/**
 * V3 SECURITY FIX: Vérifie le token commerçant contre le hash stocké en DB.
 * Le token envoyé par le client est hashé (SHA-256) et comparé au hash en DB.
 * Vérifie aussi l'expiration.
 */
async function getMerchantFromToken(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.substring(7);
  if (!token || token.length < 32) return null;

  // Hash le token reçu pour le comparer au hash stocké
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  // Cherche le commerçant par hash du token
  const merchant = await db.merchant.findFirst({
    where: {
      activeTokenHash: tokenHash,
      isActive: true,
      tokenExpiresAt: { gt: new Date() }, // pas expiré
    },
    select: { id: true, name: true, agencyId: true, commissionRate: true },
  });

  return merchant;
}

/**
 * GET /api/commercant/products — liste les produits du commerçant
 */
export async function GET(req: NextRequest) {
  const merchant = await getMerchantFromToken(req);
  if (!merchant) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const products = await db.product.findMany({
    where: { merchantId: merchant.id },
    orderBy: [{ isAvailable: 'desc' }, { name: 'asc' }],
  });

  return NextResponse.json({ success: true, products });
}

/**
 * POST /api/commercant/products — créer un produit
 */
export async function POST(req: NextRequest) {
  const merchant = await getMerchantFromToken(req);
  if (!merchant) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const body = await req.json();
  const { name, description, category, price, stock, photoUrl, deliveryMode } = body;
  if (!name || price === undefined) return NextResponse.json({ error: 'Nom et prix requis' }, { status: 400 });

  const product = await db.product.create({
    data: {
      agencyId: merchant.agencyId,
      merchantId: merchant.id,
      name, description: description || null,
      category: category || 'other',
      price,
      stock: stock || 0,
      photoUrl: photoUrl || null,
      deliveryMode: deliveryMode || 'pickup',
      isAvailable: true,
    },
  });

  return NextResponse.json({ success: true, product });
}

/**
 * PATCH /api/commercant/products — modifier un produit
 */
export async function PATCH(req: NextRequest) {
  const merchant = await getMerchantFromToken(req);
  if (!merchant) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const body = await req.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 });

  const product = await db.product.findUnique({ where: { id } });
  if (!product || product.merchantId !== merchant.id) {
    return NextResponse.json({ error: 'Produit introuvable' }, { status: 404 });
  }

  const updated = await db.product.update({
    where: { id },
    data: {
      ...(updates.name !== undefined && { name: updates.name }),
      ...(updates.description !== undefined && { description: updates.description }),
      ...(updates.category !== undefined && { category: updates.category }),
      ...(updates.price !== undefined && { price: updates.price }),
      ...(updates.stock !== undefined && { stock: updates.stock }),
      ...(updates.photoUrl !== undefined && { photoUrl: updates.photoUrl }),
      ...(updates.deliveryMode !== undefined && { deliveryMode: updates.deliveryMode }),
      ...(updates.isAvailable !== undefined && { isAvailable: updates.isAvailable }),
    },
  });

  return NextResponse.json({ success: true, product: updated });
}

/**
 * DELETE /api/commercant/products?id=xxx
 */
export async function DELETE(req: NextRequest) {
  const merchant = await getMerchantFromToken(req);
  if (!merchant) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 });

  const product = await db.product.findUnique({ where: { id } });
  if (!product || product.merchantId !== merchant.id) {
    return NextResponse.json({ error: 'Produit introuvable' }, { status: 404 });
  }

  await db.product.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
