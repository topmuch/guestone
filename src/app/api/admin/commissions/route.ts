import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/admin/commissions
 * Récupère toutes les commandes marketplace (superadmin only)
 * pour le suivi des commissions plateforme
 */
export async function GET() {
  try {
    const { getSession } = await import('@/lib/session');
    const user = await getSession();
    if (!user || (user.role !== 'superadmin' && user.role !== 'admin')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const orders = await db.marketplaceOrder.findMany({
      where: { status: 'delivered' },
      include: {
        merchant: { select: { name: true, category: true } },
        agency: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error('[api/admin/commissions] Error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
