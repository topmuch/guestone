import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAgencySubscription, assignPlanToAgency, checkPlanLimit } from '@/lib/plans';

// GET /api/subscription?agencyId=xxx — récupère l'abonnement d'un tenant
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const agencyId = searchParams.get('agencyId');
  if (!agencyId) return NextResponse.json({ error: 'agencyId requis' }, { status: 400 });

  const sub = await getAgencySubscription(agencyId);
  if (!sub) return NextResponse.json({ success: true, subscription: null });

  // Récupère aussi les limites actuelles
  const [properties, qrcodes, users] = await Promise.all([
    checkPlanLimit(agencyId, 'properties'),
    checkPlanLimit(agencyId, 'qrcodes'),
    checkPlanLimit(agencyId, 'users'),
  ]);

  return NextResponse.json({
    success: true,
    subscription: sub,
    usage: { properties, qrcodes, users },
  });
}

// POST /api/subscription — superadmin assigne un plan à un tenant
// Body: { agencyId, planId, billingCycle?, trialDays? }
export async function POST(req: NextRequest) {
  try {
    const { getSession } = await import('@/lib/session');
    const user = await getSession();
    if (!user || (user.role !== 'superadmin' && user.role !== 'admin')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await req.json();
    const { agencyId, planId, billingCycle, trialDays } = body;
    if (!agencyId || !planId) {
      return NextResponse.json({ error: 'agencyId et planId requis' }, { status: 400 });
    }

    await assignPlanToAgency(agencyId, planId, billingCycle || 'monthly', trialDays || 0);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[api/subscription POST] Error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
