import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/plans — catalogue public des plans
export async function GET() {
  const plans = await db.plan.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    include: { _count: { select: { subscriptions: true } } },
  });

  return NextResponse.json({ success: true, plans });
}

// POST /api/plans — superadmin crée un plan
export async function POST(req: NextRequest) {
  try {
    const { getSession } = await import('@/lib/session');
    const user = await getSession();
    if (!user || (user.role !== 'superadmin' && user.role !== 'admin')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, priceMonthly, priceYearly, maxProperties, maxQRCodes, maxUsers, includedModules, badge, isPopular, sortOrder } = body;
    if (!name) return NextResponse.json({ error: 'Nom requis' }, { status: 400 });

    const plan = await db.plan.create({
      data: {
        name, description,
        priceMonthly: priceMonthly || 0,
        priceYearly: priceYearly || 0,
        maxProperties: maxProperties || 1,
        maxQRCodes: maxQRCodes || 50,
        maxUsers: maxUsers || 3,
        includedModules: includedModules ? JSON.stringify(includedModules) : null,
        badge: badge || null,
        isPopular: isPopular || false,
        sortOrder: sortOrder || 0,
      },
    });

    return NextResponse.json({ success: true, plan });
  } catch (error) {
    console.error('[api/plans POST] Error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
