import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

async function getMerchantFromToken(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.substring(7);
  // Token format: merchantId-randomhex — simplification pour MVP
  // En production: table MerchantSession avec token valide
  // Ici on encode l'id dans le token: mid_<merchantId>_<random>
  if (!token.startsWith('mid_')) return null;
  const parts = token.split('_');
  if (parts.length < 3) return null;
  const merchantId = parts[1];
  const merchant = await db.merchant.findUnique({
    where: { id: merchantId },
    select: { id: true, name: true, agencyId: true, commissionRate: true },
  });
  return merchant;
}

/**
 * GET /api/commercant/products?token=mid_xxx
 * Liste les produits du commerçant
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

  // Vérifie que le produit appartient au commerçant
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
