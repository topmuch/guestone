import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * POST /api/spa/appointment — client réserve un soin
 * Body: { agencyId, spaServiceId, baggageId?, date, notes? }
 *
 * Vérifie la disponibilité (pas de chevauchement avec un autre RDV)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { agencyId, spaServiceId, baggageId, date, notes } = body;

    if (!agencyId || !spaServiceId || !date) {
      return NextResponse.json({ error: 'agencyId, spaServiceId et date requis' }, { status: 400 });
    }

    // Récupère le soin
    const service = await db.spaService.findUnique({ where: { id: spaServiceId } });
    if (!service || service.agencyId !== agencyId || !service.isActive) {
      return NextResponse.json({ error: 'Soin introuvable' }, { status: 404 });
    }

    const appointmentDate = new Date(date);
    const endTime = new Date(appointmentDate.getTime() + service.duration * 60_000);

    // Vérifie les chevauchements (même praticien ou même salle par défaut)
    const overlapping = await db.spaAppointment.findFirst({
      where: {
        agencyId,
        spaServiceId,
        status: { in: ['pending', 'confirmed'] },
        date: { lt: endTime },
        // Pour vérifier le chevauchement: appointment.date + duration > startTime
        // Prisma ne supporte pas directement, on prend tous les RDV du jour
      },
    });

    // Vérification simple: pas de RDV qui chevauche
    const sameDayAppts = await db.spaAppointment.findMany({
      where: {
        agencyId,
        spaServiceId,
        status: { in: ['pending', 'confirmed'] },
        date: {
          gte: new Date(appointmentDate.getFullYear(), appointmentDate.getMonth(), appointmentDate.getDate()),
          lt: new Date(appointmentDate.getFullYear(), appointmentDate.getMonth(), appointmentDate.getDate() + 1),
        },
      },
    });
    const hasConflict = sameDayAppts.some((a) => {
      const aEnd = new Date(a.date.getTime() + a.duration * 60_000);
      return appointmentDate < aEnd && endTime > a.date;
    });

    if (hasConflict) {
      return NextResponse.json({ error: 'Ce créneau est déjà réservé' }, { status: 409 });
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

    const appointment = await db.spaAppointment.create({
      data: {
        agencyId,
        spaServiceId,
        baggageId: baggageId || null,
        guestName, roomNumber, guestPhone,
        date: appointmentDate,
        duration: service.duration,
        price: service.price,
        notes: notes || null,
        status: 'pending',
      },
    });

    // Email staff (spa)
    try {
      const team = await db.team.findFirst({
        where: { agencyId, category: 'spa' },
        select: { email: true },
      });
      if (team?.email) {
        const { sendEmail } = await import('@/lib/email');
        await sendEmail({
          to: team.email,
          subject: `💆 Réservation Spa — ${service.name} — ${guestName || 'Client'} ${roomNumber ? `Ch. ${roomNumber}` : ''}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px;">
              <div style="background: #7c3aed; color: white; padding: 20px; border-radius: 12px 12px 0 0;">
                <h2 style="margin: 0;">💆 Nouvelle réservation Spa</h2>
              </div>
              <div style="background: white; padding: 24px; border: 1px solid #e2e8f0; border-radius: 0 0 12px 12px;">
                <p><strong>Client:</strong> ${guestName || 'Non identifié'}</p>
                ${roomNumber ? `<p><strong>Chambre:</strong> ${roomNumber}</p>` : ''}
                <p><strong>Soin:</strong> ${service.name}</p>
                <p><strong>Durée:</strong> ${service.duration} min</p>
                <p><strong>Prix:</strong> ${service.price.toLocaleString('fr-FR')} FCFA</p>
                <p><strong>Date:</strong> ${appointmentDate.toLocaleString('fr-FR')}</p>
                ${service.practitioner ? `<p><strong>Praticien:</strong> ${service.practitioner}</p>` : ''}
                ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
                <a href="${process.env.NEXT_PUBLIC_APP_URL || ''}/agence/spa" style="background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Voir le rendez-vous →</a>
              </div>
            </div>
          `,
          text: `Réservation Spa - ${service.name} - ${appointmentDate.toLocaleString('fr-FR')}`,
        });
      }
    } catch (emailErr) {
      console.error('[spa] Email failed:', emailErr);
    }

    return NextResponse.json({ success: true, appointmentId: appointment.id });
  } catch (error) {
    console.error('[api/spa/appointment POST] Error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

/**
 * GET /api/spa/appointment?agencyId=xxx — dashboard staff
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const agencyId = searchParams.get('agencyId');
  if (!agencyId) return NextResponse.json({ error: 'agencyId requis' }, { status: 400 });

  const appointments = await db.spaAppointment.findMany({
    where: { agencyId },
    include: { spaService: { select: { name: true, category: true, practitioner: true } } },
    orderBy: { date: 'desc' },
    take: 50,
  });

  return NextResponse.json({ success: true, appointments });
}

/**
 * PATCH /api/spa/appointment?id=xxx&status=xxx — staff met à jour
 */
export async function PATCH(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const status = searchParams.get('status');
  const handledBy = searchParams.get('handledBy');

  if (!id || !status) return NextResponse.json({ error: 'id et status requis' }, { status: 400 });

  const appointment = await db.spaAppointment.update({
    where: { id },
    data: { status, handledBy: handledBy || 'Staff' },
  });

  return NextResponse.json({ success: true, appointment });
}
