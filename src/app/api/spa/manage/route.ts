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

// GET — liste les soins (gestion)
export async function GET() {
  const agencyId = await getAgencyId();
  if (!agencyId) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const services = await db.spaService.findMany({
    where: { agencyId },
    orderBy: [{ category: 'asc' }, { price: 'asc' }],
    include: { _count: { select: { appointments: true } } },
  });
  return NextResponse.json({ success: true, services });
}

// POST — créer un soin
export async function POST(req: NextRequest) {
  const agencyId = await getAgencyId();
  if (!agencyId) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const body = await req.json();
  const { name, description, category, duration, price, photoUrl, practitioner, schedule } = body;
  if (!name) return NextResponse.json({ error: 'Nom requis' }, { status: 400 });

  const service = await db.spaService.create({
    data: {
      agencyId,
      name,
      description: description || null,
      category: category || 'massage',
      duration: parseInt(String(duration)) || 60,
      price: parseInt(String(price)) || 0,
      photoUrl: photoUrl || null,
      practitioner: practitioner || null,
      schedule: schedule || null,
    },
  });
  return NextResponse.json({ success: true, service });
}

// PATCH — modifier
export async function PATCH(req: NextRequest) {
  const agencyId = await getAgencyId();
  if (!agencyId) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const body = await req.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 });

  const service = await db.spaService.findUnique({ where: { id } });
  if (!service || service.agencyId !== agencyId) {
    return NextResponse.json({ error: 'Soin introuvable' }, { status: 404 });
  }

  const updated = await db.spaService.update({
    where: { id },
    data: {
      ...(updates.name !== undefined && { name: updates.name }),
      ...(updates.description !== undefined && { description: updates.description }),
      ...(updates.category !== undefined && { category: updates.category }),
      ...(updates.duration !== undefined && { duration: parseInt(String(updates.duration)) || 60 }),
      ...(updates.price !== undefined && { price: parseInt(String(updates.price)) || 0 }),
      ...(updates.photoUrl !== undefined && { photoUrl: updates.photoUrl }),
      ...(updates.practitioner !== undefined && { practitioner: updates.practitioner }),
      ...(updates.isActive !== undefined && { isActive: updates.isActive }),
    },
  });
  return NextResponse.json({ success: true, service: updated });
}

// DELETE
export async function DELETE(req: NextRequest) {
  const agencyId = await getAgencyId();
  if (!agencyId) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 });

  const service = await db.spaService.findUnique({ where: { id } });
  if (!service || service.agencyId !== agencyId) {
    return NextResponse.json({ error: 'Soin introuvable' }, { status: 404 });
  }

  await db.spaService.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
