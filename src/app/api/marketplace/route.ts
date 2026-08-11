import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/marketplace?agencyId=xxx — liste commerçants + produits publics
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const agencyId = searchParams.get('agencyId');
  if (!agencyId) return NextResponse.json({ error: 'agencyId requis' }, { status: 400 });

  const merchants = await db.merchant.findMany({
    where: { agencyId, isActive: true },
    include: {
      products: {
        where: { isAvailable: true },
        orderBy: { name: 'asc' },
      },
    },
    orderBy: [{ isVerified: 'desc' }, { name: 'asc' }],
  });

  return NextResponse.json({ success: true, merchants });
}
