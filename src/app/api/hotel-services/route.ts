import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getEnabledModules } from '@/lib/modules';

/**
 * GET /api/hotel-services?agencyId=xxx
 * Récupère les services hôtel actifs pour la page welcome (public).
 * Filtre selon les modules activés pour ce tenant (PRD §19).
 */

// Mapping catégorie de service → module requis
const CATEGORY_TO_MODULE: Record<string, string> = {
  guide: 'modeles_appareils',
  // housekeeping, maintenance, food, spa, reception, transport → demandes_service (toujours activé en MVP)
};
// Mapping displayTab help → aide_contact (toujours activé en MVP)
// Pas besoin de filtrer par onglet aide car aide_contact est requis

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const agencyId = searchParams.get('agencyId');

  if (!agencyId) {
    return NextResponse.json({ error: 'agencyId requis' }, { status: 400 });
  }

  try {
    // Récupère les modules activés pour ce tenant
    const enabledModules = await getEnabledModules(agencyId);

    const services = await db.hotelService.findMany({
      where: { agencyId, isActive: true },
      orderBy: [{ displayTab: 'asc' }, { category: 'asc' }],
      select: {
        id: true,
        name: true,
        description: true,
        icon: true,
        type: true,
        category: true,
        isFree: true,
        price: true,
        schedule: true,
        assignedTeam: true,
        displayTab: true,
        modeleId: true,
        photoCustom: true,
        videoUrl: true,
        etapes: true,
        depannage: true,
      },
    });

    // Filtre selon les modules activés
    const filteredServices = services.filter((s) => {
      // Si la catégorie nécessite un module spécifique, vérifier qu'il est activé
      const requiredModule = CATEGORY_TO_MODULE[s.category];
      if (requiredModule && !enabledModules.has(requiredModule)) return false;

      // Filtre par onglet d'affichage selon les modules
      if (s.displayTab === 'hotel' && !enabledModules.has('demandes_service') && !enabledModules.has('aide_contact') && !enabledModules.has('guide_maison')) return false;
      if (s.displayTab === 'tourism' && !enabledModules.has('tourisme_geo') && !enabledModules.has('retour_hotel')) return false;
      if (s.displayTab === 'help' && !enabledModules.has('aide_contact')) return false;

      return true;
    });

    return NextResponse.json({ success: true, services: filteredServices });
  } catch (error) {
    console.error('[api/hotel-services] Error:', error);
    return NextResponse.json({ success: true, services: [] });
  }
}

