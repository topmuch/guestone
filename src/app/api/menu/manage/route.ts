import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

async function getAgencyId(): Promise<string | null> {
  try {
    const { getSession } = await import('@/lib/session');
    const user = await getSession();
    if (!user || user.role !== 'agency' || !user.agencyId) return null;
    return user.agencyId;
  } catch { return null; }
}

// GET — liste les items du menu (gestion)
export async function GET() {
  const agencyId = await getAgencyId();
  if (!agencyId) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const items = await db.menuItem.findMany({
    where: { agencyId },
    orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }, { name: 'asc' }],
  });
  return NextResponse.json({ success: true, items });
}

// POST — créer un item
export async function POST(req: NextRequest) {
  const agencyId = await getAgencyId();
  if (!agencyId) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const body = await req.json();
  const { name, description, category, price, photoUrl, stock, deliveryMode, isAvailable } = body;
  if (!name) return NextResponse.json({ error: 'Nom requis' }, { status: 400 });

  const item = await db.menuItem.create({
    data: {
      agencyId,
      name,
      description: description || null,
      category: category || 'mains',
      price: parseInt(String(price)) || 0,
      photoUrl: photoUrl || null,
      stock: parseInt(String(stock)) || 0,
      deliveryMode: deliveryMode || 'pickup',
      isAvailable: isAvailable !== false,
    },
  });
  return NextResponse.json({ success: true, item });
}

// PATCH — modifier un item
export async function PATCH(req: NextRequest) {
  const agencyId = await getAgencyId();
  if (!agencyId) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const body = await req.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 });

  const item = await db.menuItem.findUnique({ where: { id } });
  if (!item || item.agencyId !== agencyId) {
    return NextResponse.json({ error: 'Item introuvable' }, { status: 404 });
  }

  const updated = await db.menuItem.update({
    where: { id },
    data: {
      ...(updates.name !== undefined && { name: updates.name }),
      ...(updates.description !== undefined && { description: updates.description }),
      ...(updates.category !== undefined && { category: updates.category }),
      ...(updates.price !== undefined && { price: parseInt(String(updates.price)) || 0 }),
      ...(updates.photoUrl !== undefined && { photoUrl: updates.photoUrl }),
      ...(updates.stock !== undefined && { stock: parseInt(String(updates.stock)) || 0 }),
      ...(updates.isAvailable !== undefined && { isAvailable: updates.isAvailable }),
    },
  });
  return NextResponse.json({ success: true, item: updated });
}

// DELETE — supprimer un item
export async function DELETE(req: NextRequest) {
  const agencyId = await getAgencyId();
  if (!agencyId) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 });

  const item = await db.menuItem.findUnique({ where: { id } });
  if (!item || item.agencyId !== agencyId) {
    return NextResponse.json({ error: 'Item introuvable' }, { status: 404 });
  }

  await db.menuItem.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
