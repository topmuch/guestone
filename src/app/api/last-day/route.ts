import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';

/**
 * POST /api/last-day — client demande service dernier jour
 * Body: { agencyId, baggageId?, type, details?, notes? }
 * type: "luggage" | "shower" | "transfer"
 *
 * Pour "luggage": génère un pickupCode pour retrait bagages
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { agencyId, baggageId, type, details, notes } = body;

    if (!agencyId || !type) {
      return NextResponse.json({ error: 'agencyId et type requis' }, { status: 400 });
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

    // Génère un pickup code si luggage
    const pickupCode = type === 'luggage' ? crypto.randomBytes(3).toString('hex').toUpperCase() : null;

    const request = await db.lastDayRequest.create({
      data: {
        agencyId,
        baggageId: baggageId || null,
        guestName, roomNumber, guestPhone,
        type,
        details: details ? JSON.stringify(details) : null,
        notes: notes || null,
        status: 'pending',
        pickupCode,
      },
    });

    // Email staff (réception)
    try {
      const team = await db.team.findFirst({
        where: { agencyId, category: 'reception' },
        select: { email: true },
      });
      if (team?.email) {
        const { sendEmail } = await import('@/lib/email');
        const typeLabels: Record<string, string> = {
          luggage: '🧳 Dépôt bagages',
          shower: '🚿 Réservation douche',
          transfer: '🚐 Transfert aéroport',
        };
        await sendEmail({
          to: team.email,
          subject: `${typeLabels[type] || type} — ${guestName || 'Client'} ${roomNumber ? `Ch. ${roomNumber}` : ''}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px;">
              <div style="background: #134288; color: white; padding: 20px; border-radius: 12px 12px 0 0;">
                <h2 style="margin: 0;">${typeLabels[type] || type}</h2>
                <p style="margin: 8px 0 0 0;">Mode Dernier Jour</p>
              </div>
              <div style="background: white; padding: 24px; border: 1px solid #e2e8f0; border-radius: 0 0 12px 12px;">
                <p><strong>Client:</strong> ${guestName || 'Non identifié'}</p>
                ${roomNumber ? `<p><strong>Chambre:</strong> ${roomNumber}</p>` : ''}
                ${details ? `<p><strong>Détails:</strong> <pre>${JSON.stringify(details, null, 2)}</pre></p>` : ''}
                ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
                ${pickupCode ? `<div style="background: #fef3c7; padding: 12px; border-radius: 8px; margin: 16px 0;"><p style="margin: 0;"><strong>Code de retrait bagages:</strong> <span style="font-family: monospace; font-size: 24px; font-weight: bold; color: #92400e;">${pickupCode}</span></p></div>` : ''}
                <a href="${process.env.NEXT_PUBLIC_APP_URL || ''}/agence/dernier-jour" style="background: #134288; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Voir la demande →</a>
              </div>
            </div>
          `,
          text: `${typeLabels[type] || type} — ${guestName || 'Client'} ${roomNumber ? `Ch. ${roomNumber}` : ''}`,
        });
      }
    } catch (emailErr) {
      console.error('[last-day] Email failed:', emailErr);
    }

    return NextResponse.json({ success: true, requestId: request.id, pickupCode });
  } catch (error) {
    console.error('[api/last-day POST] Error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

/**
 * GET /api/last-day?agencyId=xxx — dashboard staff
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const agencyId = searchParams.get('agencyId');
  if (!agencyId) return NextResponse.json({ error: 'agencyId requis' }, { status: 400 });

  const requests = await db.lastDayRequest.findMany({
    where: { agencyId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return NextResponse.json({ success: true, requests });
}

/**
 * PATCH /api/last-day?id=xxx&status=xxx — staff met à jour
 */
export async function PATCH(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const status = searchParams.get('status');
  const handledBy = searchParams.get('handledBy');

  if (!id || !status) return NextResponse.json({ error: 'id et status requis' }, { status: 400 });

  const request = await db.lastDayRequest.update({
    where: { id },
    data: { status, handledBy: handledBy || 'Staff' },
  });

  return NextResponse.json({ success: true, request });
}
