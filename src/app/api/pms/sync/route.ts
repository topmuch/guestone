import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * POST /api/pms/sync?agencyId=xxx
 *
 * V3: Synchronise les réservations depuis le PMS (Cloudbeds/MeWS/Sirvoy)
 * vers le modèle Stay local.
 *
 * Étapes:
 * 1. Récupère la config PMS de l'agence
 * 2. Appelle le provider PMS pour récupérer les réservations
 * 3. Upsert dans Stay (crée ou met à jour)
 * 4. Active/désactive les bracelets liés selon les dates
 *
 * Header: Authorization: Bearer ${CRON_SECRET} (pour appels cron)
 * ou session staff (pour sync manuelle)
 */
export async function POST(req: NextRequest) {
  try {
    // Auth: session staff ou cron secret
    const { searchParams } = new URL(req.url);
    const agencyId = searchParams.get('agencyId');
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    let isAuthorized = false;
    if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
      isAuthorized = true;
    } else {
      const { getSession } = await import('@/lib/session');
      const user = await getSession();
      if (user && user.agencyId === agencyId) isAuthorized = true;
    }

    if (!isAuthorized) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    if (!agencyId) return NextResponse.json({ error: 'agencyId requis' }, { status: 400 });

    // Récupère l'agence avec config PMS
    const agency = await db.agency.findUnique({
      where: { id: agencyId },
      select: {
        pmsProvider: true,
        pmsApiKeys: true,
        pmsPropertyId: true,
        name: true,
      },
    });

    if (!agency) return NextResponse.json({ error: 'Agence introuvable' }, { status: 404 });
    if (!agency.pmsProvider) {
      return NextResponse.json({ error: 'PMS non configuré', synced: 0 });
    }

    // Parse les clés API
    let apiConfig: { apiKey?: string; propertyId?: string; baseUrl?: string } = {};
    try {
      apiConfig = agency.pmsApiKeys ? JSON.parse(agency.pmsApiKeys) : {};
    } catch {
      return NextResponse.json({ error: 'Configuration PMS invalide' }, { status: 400 });
    }

    // Appelle le provider PMS
    let reservations: unknown[] = [];
    try {
      const { pmsService } = await import('@/lib/pms/pmsService');
      reservations = await pmsService.getReservations(agencyId, {
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 prochains jours
      });
    } catch (pmsErr) {
      console.error('[pms/sync] PMS call failed:', pmsErr);
      return NextResponse.json({
        error: 'Échec appel PMS',
        details: pmsErr instanceof Error ? pmsErr.message : 'Erreur inconnue',
      }, { status: 502 });
    }

    // Upsert chaque réservation dans Stay
    let synced = 0;
    let updated = 0;
    for (const r of reservations) {
      const reservation = r as {
        id?: string;
        reference?: string;
        guestName?: string;
        guestEmail?: string;
        guestPhone?: string;
        roomNumber?: string;
        checkInDate?: string;
        checkOutDate?: string;
        language?: string;
        nbPersons?: number;
        status?: string;
      };

      const stayRef = reservation.id || reservation.reference;
      if (!stayRef) continue;

      // Vérifie si le stay existe déjà (par reference ou guestEmail + dates)
      const existing = await db.stay.findFirst({
        where: {
          agencyId,
          OR: [
            { guestEmail: reservation.guestEmail || '' },
          ],
        },
      });

      const stayData = {
        agencyId,
        roomNumber: reservation.roomNumber || null,
        guestName: reservation.guestName || null,
        guestEmail: reservation.guestEmail || null,
        guestPhone: reservation.guestPhone || null,
        language: reservation.language || 'fr',
        checkInDate: reservation.checkInDate ? new Date(reservation.checkInDate) : new Date(),
        checkOutDate: reservation.checkOutDate ? new Date(reservation.checkOutDate) : new Date(Date.now() + 24 * 60 * 60 * 1000),
        nbPersons: reservation.nbPersons || 1,
        status: reservation.status === 'cancelled' ? 'cancelled' : 'active',
      };

      if (existing) {
        await db.stay.update({ where: { id: existing.id }, data: stayData });
        updated++;
      } else {
        await db.stay.create({ data: stayData });
        synced++;
      }
    }

    // Log de la sync
    await db.systemLog.create({
      data: {
        level: 'info',
        message: `PMS sync: ${synced} nouveaux, ${updated} mis à jour`,
        source: 'api/pms/sync',
        metadata: JSON.stringify({ agencyId, provider: agency.pmsProvider, synced, updated }),
      },
    });

    return NextResponse.json({
      success: true,
      synced,
      updated,
      total: reservations.length,
      provider: agency.pmsProvider,
    });
  } catch (error) {
    console.error('[api/pms/sync] Error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
