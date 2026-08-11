import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/spa?agencyId=xxx — liste soins publics
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const agencyId = searchParams.get('agencyId');
  if (!agencyId) return NextResponse.json({ error: 'agencyId requis' }, { status: 400 });

  const services = await db.spaService.findMany({
    where: { agencyId, isActive: true },
    orderBy: [{ category: 'asc' }, { price: 'asc' }],
  });

  return NextResponse.json({ success: true, services });
}
