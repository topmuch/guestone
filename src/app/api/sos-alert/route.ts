import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * POST /api/sos-alert — client déclenche SOS (maintenir 3s déjà fait côté client)
 * Body: { agencyId, baggageId?, latitude?, longitude?, message? }
 *
 * Logique PRD §14.9:
 *   - Récupère infos client (nom, chambre, téléphone) depuis Stay
 *   - Enregistre l'alerte en statut "active"
 *   - Envoie email au staff (réception + management)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { agencyId, baggageId, latitude, longitude, message } = body;

    if (!agencyId) return NextResponse.json({ error: 'agencyId requis' }, { status: 400 });

    // Récupère infos client + agence
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

    const agency = await db.agency.findUnique({
      where: { id: agencyId },
      select: { name: true },
    });

    // Crée l'alerte
    const alert = await db.sosAlert.create({
      data: {
        agencyId,
        baggageId: baggageId || null,
        guestName, roomNumber, guestPhone,
        latitude: latitude || null,
        longitude: longitude || null,
        message: message || null,
        status: 'active',
      },
    });

    // Envoie email au staff (réception + management)
    try {
      const teams = await db.team.findMany({
        where: { agencyId, category: { in: ['reception', 'management'] } },
        select: { email: true, category: true },
      });
      if (teams.length > 0) {
        const emails = teams.map((t) => t.email);
        const mapsLink = latitude && longitude
          ? `https://www.google.com/maps?q=${latitude},${longitude}`
          : 'Position non disponible';
        const { sendEmail } = await import('@/lib/email');
        await sendEmail({
          to: emails,
          subject: `🆘 SOS ALERT — ${guestName || 'Client'} ${roomNumber ? `Ch. ${roomNumber}` : ''} — ${agency?.name || ''}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px;">
              <div style="background: #dc2626; color: white; padding: 20px; border-radius: 12px 12px 0 0;">
                <h2 style="margin: 0;">🆘 ALERTE SOS</h2>
                <p style="margin: 8px 0 0 0;">Un client a déclenché une alerte SOS.</p>
              </div>
              <div style="background: white; padding: 24px; border: 1px solid #e2e8f0; border-radius: 0 0 12px 12px;">
                <p><strong>Client:</strong> ${guestName || 'Non identifié'}</p>
                ${roomNumber ? `<p><strong>Chambre:</strong> ${roomNumber}</p>` : ''}
                ${guestPhone ? `<p><strong>Téléphone:</strong> <a href="tel:${guestPhone}">${guestPhone}</a></p>` : ''}
                ${message ? `<p><strong>Message:</strong> ${message}</p>` : ''}
                <p><strong>Position:</strong> <a href="${mapsLink}">${mapsLink}</a></p>
                <p><strong>Heure:</strong> ${new Date().toLocaleString('fr-FR')}</p>
                <div style="margin-top: 24px;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://entreprise.qrtags.pro'}/agence/sos" style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Voir dans le dashboard →</a>
                </div>
              </div>
            </div>
          `,
          text: `SOS ALERT — ${guestName || 'Client'} ${roomNumber ? `Ch. ${roomNumber}` : ''} — Position: ${mapsLink}`,
        });

        await db.sosAlert.update({
          where: { id: alert.id },
          data: { emailSent: true, emailRecipients: emails.join(',') },
        });
      }
    } catch (emailErr) {
      console.error('[sos-alert] Email failed:', emailErr);
    }

    return NextResponse.json({ success: true, alertId: alert.id });
  } catch (error) {
    console.error('[api/sos-alert POST] Error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

/**
 * GET /api/sos-alert?agencyId=xxx — dashboard staff
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const agencyId = searchParams.get('agencyId');
  if (!agencyId) return NextResponse.json({ error: 'agencyId requis' }, { status: 400 });

  const alerts = await db.sosAlert.findMany({
    where: { agencyId },
    orderBy: { createdAt: 'desc' },
    take: 30,
  });

  return NextResponse.json({ success: true, alerts });
}

/**
 * PATCH /api/sos-alert — staff met à jour le statut
 * Body: { id, status, resolutionNote?, isFalseAlarm?, handledBy? }
 */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, resolutionNote, isFalseAlarm, handledBy } = body;
    if (!id || !status) return NextResponse.json({ error: 'id et status requis' }, { status: 400 });

    const data: Record<string, unknown> = { status };
    if (resolutionNote) data.resolutionNote = resolutionNote;
    if (isFalseAlarm !== undefined) data.isFalseAlarm = isFalseAlarm;
    if (handledBy) data.handledBy = handledBy;
    if (status === 'acknowledged') data.acknowledgedAt = new Date();
    if (status === 'resolved' || status === 'false_alarm') data.resolvedAt = new Date();

    const alert = await db.sosAlert.update({ where: { id }, data });
    return NextResponse.json({ success: true, alert });
  } catch (error) {
    console.error('[api/sos-alert PATCH] Error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
