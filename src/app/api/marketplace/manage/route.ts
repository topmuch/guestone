import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';

async function getAgencyId(): Promise<string | null> {
  try {
    const { getSession } = await import('@/lib/session');
    const user = await getSession();
    if (!user || user.role !== 'agency' || !user.agencyId) return null;
    return user.agencyId;
  } catch { return null; }
}

// GET — liste commerçants + produits
export async function GET() {
  const agencyId = await getAgencyId();
  if (!agencyId) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const merchants = await db.merchant.findMany({
    where: { agencyId },
    include: { products: true, _count: { select: { marketplaceOrders: true } } },
    orderBy: [{ isVerified: 'desc' }, { name: 'asc' }],
  });
  return NextResponse.json({ success: true, merchants });
}

// POST — créer commerçant ou produit
export async function POST(req: NextRequest) {
  const agencyId = await getAgencyId();
  if (!agencyId) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const body = await req.json();
  const { type, ...data } = body;

  if (type === 'merchant') {
    if (!data.name) return NextResponse.json({ error: 'Nom requis' }, { status: 400 });
    const merchant = await db.merchant.create({
      data: {
        agencyId,
        name: data.name,
        description: data.description || null,
        category: data.category || 'other',
        phone: data.phone || null,
        email: data.email || null,
        website: data.website || null,
        logoUrl: data.logoUrl || null,
        commissionRate: parseFloat(String(data.commissionRate)) || 10,
        accessCode: crypto.randomBytes(6).toString('hex').toUpperCase(),
        isActive: true,
      },
    });
    return NextResponse.json({ success: true, merchant });
  }

  if (type === 'product') {
    if (!data.name || !data.merchantId) return NextResponse.json({ error: 'Nom et commerçant requis' }, { status: 400 });
    const product = await db.product.create({
      data: {
        agencyId,
        merchantId: data.merchantId,
        name: data.name,
        description: data.description || null,
        category: data.category || 'other',
        price: parseInt(String(data.price)) || 0,
        photoUrl: data.photoUrl || null,
        stock: parseInt(String(data.stock)) || 0,
        deliveryMode: data.deliveryMode || 'pickup',
        isAvailable: true,
      },
    });
    return NextResponse.json({ success: true, product });
  }

  return NextResponse.json({ error: 'Type inconnu' }, { status: 400 });
}

// PATCH — modifier
export async function PATCH(req: NextRequest) {
  const agencyId = await getAgencyId();
  if (!agencyId) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const body = await req.json();
  const { type, id, ...updates } = body;

  if (type === 'merchant') {
    const m = await db.merchant.findUnique({ where: { id } });
    if (!m || m.agencyId !== agencyId) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });
    const updated = await db.merchant.update({ where: { id }, data: {
      ...(updates.name !== undefined && { name: updates.name }),
      ...(updates.description !== undefined && { description: updates.description }),
      ...(updates.category !== undefined && { category: updates.category }),
      ...(updates.phone !== undefined && { phone: updates.phone }),
      ...(updates.email !== undefined && { email: updates.email }),
      ...(updates.commissionRate !== undefined && { commissionRate: parseFloat(String(updates.commissionRate)) || 10 }),
      ...(updates.isActive !== undefined && { isActive: updates.isActive }),
    }});
    return NextResponse.json({ success: true, merchant: updated });
  }

  if (type === 'product') {
    const p = await db.product.findUnique({ where: { id } });
    if (!p || p.agencyId !== agencyId) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });
    const updated = await db.product.update({ where: { id }, data: {
      ...(updates.name !== undefined && { name: updates.name }),
      ...(updates.description !== undefined && { description: updates.description }),
      ...(updates.price !== undefined && { price: parseInt(String(updates.price)) || 0 }),
      ...(updates.stock !== undefined && { stock: parseInt(String(updates.stock)) || 0 }),
      ...(updates.photoUrl !== undefined && { photoUrl: updates.photoUrl }),
      ...(updates.isAvailable !== undefined && { isAvailable: updates.isAvailable }),
    }});
    return NextResponse.json({ success: true, product: updated });
  }

  return NextResponse.json({ error: 'Type inconnu' }, { status: 400 });
}

// DELETE
export async function DELETE(req: NextRequest) {
  const agencyId = await getAgencyId();
  if (!agencyId) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const type = searchParams.get('type');
  if (!id || !type) return NextResponse.json({ error: 'id et type requis' }, { status: 400 });

  if (type === 'merchant') {
    const m = await db.merchant.findUnique({ where: { id } });
    if (!m || m.agencyId !== agencyId) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });
    await db.merchant.delete({ where: { id } });
  } else if (type === 'product') {
    const p = await db.product.findUnique({ where: { id } });
    if (!p || p.agencyId !== agencyId) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });
    await db.product.delete({ where: { id } });
  }

  return NextResponse.json({ success: true });
}
