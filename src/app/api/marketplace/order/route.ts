import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * POST /api/marketplace/order — client passe commande marketplace
 * Body: { agencyId, merchantId, baggageId?, items: [{ productId, quantity }], deliveryMode?, deliveryAddress?, notes? }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { agencyId, merchantId, baggageId, items, deliveryMode, deliveryAddress, notes } = body;

    if (!agencyId || !merchantId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'agencyId, merchantId et items requis' }, { status: 400 });
    }

    // Récupère le commerçant
    const merchant = await db.merchant.findUnique({ where: { id: merchantId } });
    if (!merchant || merchant.agencyId !== agencyId || !merchant.isActive) {
      return NextResponse.json({ error: 'Commerçant introuvable' }, { status: 404 });
    }

    // Récupère infos client
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

    // Récupère les produits
    const productIds = items.map((i: { productId: string }) => i.productId);
    const products = await db.product.findMany({
      where: { id: { in: productIds }, agencyId, merchantId, isAvailable: true },
    });

    // Calcule le total + snapshot
    let totalAmount = 0;
    const orderItemsData = items.map((i: { productId: string; quantity: number }) => {
      const p = products.find((pr) => pr.id === i.productId);
      if (!p) throw new Error(`Produit ${i.productId} introuvable`);
      const qty = parseInt(String(i.quantity)) || 1;
      const lineTotal = p.price * qty;
      totalAmount += lineTotal;
      return {
        productId: p.id,
        name: p.name,
        price: p.price,
        quantity: qty,
      };
    });

    // Calcule commission multi-niveaux V3
    const commissionRate = merchant.commissionRate;
    const commissionAmount = Math.round(totalAmount * commissionRate / 100);
    const merchantAmount = totalAmount - commissionAmount;

    // V3: Commission plateforme Guest One (prélevée sur la commission hôtel)
    const platformRate = parseFloat(process.env.PLATFORM_COMMISSION_RATE || '5'); // 5% par défaut
    const platformAmount = Math.round(commissionAmount * platformRate / 100);
    const agencyNetAmount = commissionAmount - platformAmount;

    const order = await db.marketplaceOrder.create({
      data: {
        agencyId,
        merchantId,
        baggageId: baggageId || null,
        guestName, roomNumber, guestPhone,
        totalAmount,
        commissionRate,
        commissionAmount,
        merchantAmount,
        platformRate,
        platformAmount,
        agencyNetAmount,
        deliveryMode: deliveryMode || 'pickup',
        deliveryAddress: deliveryAddress || null,
        notes: notes || null,
        status: 'pending',
        items: { create: orderItemsData },
      },
      include: { items: true },
    });

    // Email commerçant (si email configuré)
    if (merchant.email) {
      try {
        const { sendEmail } = await import('@/lib/email');
        const itemsList = orderItemsData.map((i) => `  • ${i.quantity}x ${i.name} — ${i.price * i.quantity} FCFA`).join('\n');
        await sendEmail({
          to: merchant.email,
          subject: `🛍️ Nouvelle commande — ${merchant.name}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px;">
              <div style="background: #ea580c; color: white; padding: 20px; border-radius: 12px 12px 0 0;">
                <h2 style="margin: 0;">🛍️ Nouvelle commande</h2>
              </div>
              <div style="background: white; padding: 24px; border: 1px solid #e2e8f0; border-radius: 0 0 12px 12px;">
                <p><strong>Client:</strong> ${guestName || 'Non identifié'} ${roomNumber ? `(Ch. ${roomNumber})` : ''}</p>
                <p><strong>Articles:</strong></p>
                <pre style="background: #f8fafc; padding: 12px; border-radius: 8px;">${itemsList}</pre>
                <p><strong>Total:</strong> ${totalAmount.toLocaleString('fr-FR')} FCFA</p>
                <p><strong>Commission (${commissionRate}%):</strong> ${commissionAmount.toLocaleString('fr-FR')} FCFA</p>
                <p><strong>Votre montant net:</strong> ${merchantAmount.toLocaleString('fr-FR')} FCFA</p>
                <p><strong>Livraison:</strong> ${deliveryMode === 'delivery' ? 'Livraison' : 'Retrait sur place'}</p>
                ${deliveryAddress ? `<p><strong>Adresse:</strong> ${deliveryAddress}</p>` : ''}
                ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
              </div>
            </div>
          `,
          text: `Nouvelle commande - Total: ${totalAmount} FCFA - Net: ${merchantAmount} FCFA`,
        });
      } catch (emailErr) {
        console.error('[marketplace] Email failed:', emailErr);
      }
    }

    return NextResponse.json({ success: true, orderId: order.id, totalAmount, merchantAmount });
  } catch (error) {
    console.error('[api/marketplace/order POST] Error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

/**
 * GET /api/marketplace/order?agencyId=xxx — dashboard staff
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const agencyId = searchParams.get('agencyId');
  if (!agencyId) return NextResponse.json({ error: 'agencyId requis' }, { status: 400 });

  const orders = await db.marketplaceOrder.findMany({
    where: { agencyId },
    include: {
      items: true,
      merchant: { select: { name: true, category: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return NextResponse.json({ success: true, orders });
}

/**
 * PATCH /api/marketplace/order?id=xxx&status=xxx — staff met à jour
 */
export async function PATCH(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const status = searchParams.get('status');
  const handledBy = searchParams.get('handledBy');

  if (!id || !status) return NextResponse.json({ error: 'id et status requis' }, { status: 400 });

  const order = await db.marketplaceOrder.update({
    where: { id },
    data: { status, handledBy: handledBy || 'Staff' },
  });

  return NextResponse.json({ success: true, order });
}
