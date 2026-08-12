import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * POST /api/orders — client passe commande
 * Body: { agencyId, baggageId?, items: [{ menuItemId, quantity }], notes?, paymentMethod? }
 *
 * Statuts: pending → confirmed → preparing → ready → delivered | cancelled
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { agencyId, baggageId, items, notes, paymentMethod } = body;

    if (!agencyId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'agencyId et items requis' }, { status: 400 });
    }

    // Récupère les infos client depuis Stay si baggageId
    let guestName: string | null = null;
    let roomNumber: string | null = null;
    let guestPhone: string | null = null;
    if (baggageId) {
      const stay = await db.stay.findFirst({
        where: { baggageId, status: 'active' },
        select: { guestName: true, roomNumber: true, guestPhone: true },
      });
      if (stay) {
        guestName = stay.guestName;
        roomNumber = stay.roomNumber;
        guestPhone = stay.guestPhone;
      }
    }

    // Récupère les menu items pour snapshot
    const menuItemIds = items.map((i: { menuItemId: string }) => i.menuItemId);
    const menuItems = await db.menuItem.findMany({
      where: { id: { in: menuItemIds }, agencyId, isAvailable: true },
    });

    // Calcule le total + prépare les OrderItem
    let totalAmount = 0;
    const orderItemsData = items.map((i: { menuItemId: string; quantity: number }) => {
      const mi = menuItems.find((m) => m.id === i.menuItemId);
      if (!mi) throw new Error(`Menu item ${i.menuItemId} introuvable`);
      const qty = parseInt(String(i.quantity)) || 1;
      const lineTotal = mi.price * qty;
      totalAmount += lineTotal;
      return {
        menuItemId: mi.id,
        name: mi.name,
        price: mi.price,
        quantity: qty,
      };
    });

    const order = await db.order.create({
      data: {
        agencyId,
        baggageId: baggageId || null,
        guestName, roomNumber, guestPhone,
        totalAmount,
        notes: notes || null,
        status: 'pending',
        paymentMethod: paymentMethod || 'room',
        items: { create: orderItemsData },
      },
      include: { items: true },
    });

    // Email staff (cuisine)
    try {
      const team = await db.team.findFirst({
        where: { agencyId, category: 'kitchen' },
        select: { email: true },
      });
      if (team?.email) {
        const { sendEmail } = await import('@/lib/email');
        const itemsList = orderItemsData.map((i) => `  • ${i.quantity}x ${i.name} — ${i.price * i.quantity} FCFA`).join('\n');
        await sendEmail({
          to: team.email,
          subject: `🍽️ Commande Room Service — Ch. ${roomNumber || 'N/A'} — ${totalAmount} FCFA`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px;">
              <div style="background: #16a34a; color: white; padding: 20px; border-radius: 12px 12px 0 0;">
                <h2 style="margin: 0;">🍽️ Nouvelle commande Room Service</h2>
              </div>
              <div style="background: white; padding: 24px; border: 1px solid #e2e8f0; border-radius: 0 0 12px 12px;">
                <p><strong>Client:</strong> ${guestName || 'Non identifié'}</p>
                ${roomNumber ? `<p><strong>Chambre:</strong> ${roomNumber}</p>` : ''}
                <p><strong>Articles:</strong></p>
                <pre style="background: #f8fafc; padding: 12px; border-radius: 8px; font-family: monospace;">${itemsList}</pre>
                <p><strong>Total:</strong> ${totalAmount} FCFA</p>
                <p><strong>Paiement:</strong> ${paymentMethod === 'room' ? 'Facture chambre' : paymentMethod}</p>
                ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
                <a href="${process.env.NEXT_PUBLIC_APP_URL || ''}/agence/room-service" style="background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Voir la commande →</a>
              </div>
            </div>
          `,
          text: `Commande Room Service - Ch. ${roomNumber || 'N/A'} - ${totalAmount} FCFA`,
        });
      }
    } catch (emailErr) {
      console.error('[orders] Email failed:', emailErr);
    }

    return NextResponse.json({ success: true, orderId: order.id, totalAmount });
  } catch (error) {
    console.error('[api/orders POST] Error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

/**
 * GET /api/orders?agencyId=xxx&status=xxx — dashboard staff
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const agencyId = searchParams.get('agencyId');
  const status = searchParams.get('status');
  if (!agencyId) return NextResponse.json({ error: 'agencyId requis' }, { status: 400 });

  const orders = await db.order.findMany({
    where: { agencyId, ...(status && status !== 'all' ? { status } : {}) },
    include: { items: true },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return NextResponse.json({ success: true, orders });
}

/**
 * PATCH /api/orders?id=xxx&status=xxx — staff met à jour le statut
 */
export async function PATCH(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const status = searchParams.get('status');
  const handledBy = searchParams.get('handledBy');

  if (!id || !status) return NextResponse.json({ error: 'id et status requis' }, { status: 400 });

  const order = await db.order.update({
    where: { id },
    data: { status, handledBy: handledBy || 'Staff' },
  });

  return NextResponse.json({ success: true, order });
}
