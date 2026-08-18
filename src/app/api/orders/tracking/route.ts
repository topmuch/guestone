import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/orders/tracking?baggageId=xxx&agencyId=xxx — suivi commandes guest
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const baggageId = searchParams.get('baggageId');
  const agencyId = searchParams.get('agencyId');
  const reference = searchParams.get('reference');

  if (!agencyId) return NextResponse.json({ error: 'agencyId requis' }, { status: 400 });

  // Trouver le baggageId via reference si pas direct
  let effectiveBaggageId = baggageId;
  if (!effectiveBaggageId && reference) {
    const baggage = await db.baggage.findFirst({
      where: { reference, agencyId },
      select: { id: true },
    });
    effectiveBaggageId = baggage?.id || null;
  }

  // Room service orders
  const roomServiceOrders = effectiveBaggageId
    ? await db.order.findMany({
        where: { baggageId: effectiveBaggageId, agencyId },
        include: { items: true },
        orderBy: { createdAt: 'desc' },
        take: 20,
      })
    : [];

  // Marketplace orders
  const marketplaceOrders = effectiveBaggageId
    ? await db.marketplaceOrder.findMany({
        where: { baggageId: effectiveBaggageId, agencyId },
        include: {
          items: true,
          merchant: { select: { name: true, logoUrl: true, category: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      })
    : [];

  // Combiner et normaliser
  type TrackedOrder = {
    id: string;
    type: 'roomservice' | 'marketplace';
    status: string;
    totalAmount: number;
    createdAt: Date;
    items: { name: string; quantity: number; price: number }[];
    merchantName?: string | null;
    merchantLogo?: string | null;
    deliveryMode?: string;
    deliveryAddress?: string | null;
  };

  const orders: TrackedOrder[] = [
    ...roomServiceOrders.map((o) => ({
      id: o.id,
      type: 'roomservice' as const,
      status: o.status,
      totalAmount: o.totalAmount,
      createdAt: o.createdAt,
      items: o.items.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price })),
    })),
    ...marketplaceOrders.map((o) => ({
      id: o.id,
      type: 'marketplace' as const,
      status: o.status,
      totalAmount: o.totalAmount,
      createdAt: o.createdAt,
      items: o.items.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price })),
      merchantName: o.merchant.name,
      merchantLogo: o.merchant.logoUrl,
      deliveryMode: o.deliveryMode,
      deliveryAddress: o.deliveryAddress,
    })),
  ];

  // Trier par date desc
  orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Dernière commande pour re-order
  const lastOrder = orders.length > 0 ? orders[0] : null;

  return NextResponse.json({
    success: true,
    orders: orders.slice(0, 20),
    lastOrder,
    stats: {
      total: orders.length,
      pending: orders.filter((o) => ['pending', 'confirmed', 'accepted'].includes(o.status)).length,
      active: orders.filter((o) => ['preparing', 'ready'].includes(o.status)).length,
      delivered: orders.filter((o) => o.status === 'delivered').length,
    },
  });
}
