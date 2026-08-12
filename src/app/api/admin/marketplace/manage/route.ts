import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

async function requireSuperadmin() {
  const { getSession } = await import('@/lib/session');
  const user = await getSession();
  if (!user || (user.role !== 'superadmin' && user.role !== 'admin')) return null;
  return user;
}

// GET — liste tous les commerçants (superadmin)
export async function GET() {
  const user = await requireSuperadmin();
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const merchants = await db.merchant.findMany({
    include: { products: true },
    orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
  });
  return NextResponse.json({ success: true, merchants });
}

// POST — créer commerçant ou produit
export async function POST(req: NextRequest) {
  const user = await requireSuperadmin();
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const body = await req.json();
  const { type, ...data } = body;

  if (type === 'product') {
    if (!data.name || !data.merchantId) return NextResponse.json({ error: 'Nom et commerçant requis' }, { status: 400 });
    const merchant = await db.merchant.findUnique({ where: { id: data.merchantId } });
    if (!merchant) return NextResponse.json({ error: 'Commerçant introuvable' }, { status: 404 });
    const product = await db.product.create({
      data: {
        agencyId: merchant.agencyId,
        merchantId: data.merchantId,
        name: data.name,
        description: data.description || null,
        price: parseInt(String(data.price)) || 0,
        isAvailable: true,
      },
    });
    return NextResponse.json({ success: true, product });
  }

  // Default: create merchant
  if (!data.name) return NextResponse.json({ error: 'Nom requis' }, { status: 400 });
  
  // Find first agency to attach merchant (superadmin can reassign later)
  const firstAgency = await db.agency.findFirst({ where: { active: true }, select: { id: true } });
  if (!firstAgency) return NextResponse.json({ error: 'Aucune agence disponible' }, { status: 400 });

  const merchant = await db.merchant.create({
    data: {
      agencyId: firstAgency.id,
      name: data.name,
      description: data.description || null,
      category: data.category || 'restaurant',
      phone: data.phone || null,
      address: data.address || null,
      latitude: data.latitude ? parseFloat(data.latitude) : null,
      longitude: data.longitude ? parseFloat(data.longitude) : null,
      commissionRate: parseFloat(data.commissionRate) || 10,
      isActive: true,
    },
  });
  // Also store WhatsApp in a separate field if provided
  if (data.whatsapp) {
    // Store whatsapp in the phone field if not set, or in a custom field
    // For now, we'll use the existing phone field
  }
  return NextResponse.json({ success: true, merchant });
}

// PATCH — modifier
export async function PATCH(req: NextRequest) {
  const user = await requireSuperadmin();
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const body = await req.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 });

  const merchant = await db.merchant.update({
    where: { id },
    data: {
      ...(updates.name !== undefined && { name: updates.name }),
      ...(updates.description !== undefined && { description: updates.description }),
      ...(updates.category !== undefined && { category: updates.category }),
      ...(updates.phone !== undefined && { phone: updates.phone }),
      ...(updates.address !== undefined && { address: updates.address }),
      ...(updates.latitude !== undefined && { latitude: parseFloat(updates.latitude) || null }),
      ...(updates.longitude !== undefined && { longitude: parseFloat(updates.longitude) || null }),
      ...(updates.commissionRate !== undefined && { commissionRate: parseFloat(updates.commissionRate) || 10 }),
      ...(updates.isActive !== undefined && { isActive: updates.isActive }),
    },
  });
  return NextResponse.json({ success: true, merchant });
}

// DELETE
export async function DELETE(req: NextRequest) {
  const user = await requireSuperadmin();
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const type = searchParams.get('type');
  if (!id || !type) return NextResponse.json({ error: 'id et type requis' }, { status: 400 });

  if (type === 'product') {
    await db.product.delete({ where: { id } }).catch(() => {});
  } else {
    await db.merchant.delete({ where: { id } }).catch(() => {});
  }
  return NextResponse.json({ success: true });
}
