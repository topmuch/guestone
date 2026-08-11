import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getEnabledModules, setModuleEnabled, invalidateModuleCache } from '@/lib/modules';

// GET /api/modules/tenant?agencyId=xxx — modules activés pour un tenant
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const agencyId = searchParams.get('agencyId');
  if (!agencyId) return NextResponse.json({ error: 'agencyId requis' }, { status: 400 });

  // Récupère le catalogue + les activations du tenant
  const [allModules, tenantModules] = await Promise.all([
    db.module.findMany({ where: { isActive: true }, orderBy: [{ category: 'asc' }, { priority: 'asc' }] }),
    db.tenantModule.findMany({ where: { agencyId }, select: { moduleKey: true, enabled: true, config: true } }),
  ]);
  const tenantMap = new Map(tenantModules.map((tm) => [tm.moduleKey, tm]));

  const enabledSet = await getEnabledModules(agencyId);

  const result = allModules.map((m) => {
    const tm = tenantMap.get(m.key);
    return {
      key: m.key,
      name: m.name,
      description: m.description,
      category: m.category,
      icon: m.icon,
      dependencies: m.dependencies,
      isRequired: m.isRequired,
      phase: m.phase,
      // État effectif (ce que le client voit)
      effectiveEnabled: enabledSet.has(m.key),
      // État personnalisé par le tenant (null = utilise defaultEnabled)
      tenantOverride: tm ? tm.enabled : null,
      config: tm?.config ? JSON.parse(tm.config) : null,
    };
  });

  return NextResponse.json({ success: true, modules: result });
}

// PATCH /api/modules/tenant — active/désactive un module pour un tenant
// Body: { agencyId, moduleKey, enabled, config? }
export async function PATCH(req: NextRequest) {
  try {
    // Auth: superadmin uniquement
    const { getSession } = await import('@/lib/session');
    const user = await getSession();
    if (!user || (user.role !== 'superadmin' && user.role !== 'admin')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await req.json();
    const { agencyId, moduleKey, enabled, config } = body;
    if (!agencyId || !moduleKey) {
      return NextResponse.json({ error: 'agencyId et moduleKey requis' }, { status: 400 });
    }

    // Vérifie que le module existe et n'est pas required
    const module = await db.module.findUnique({ where: { key: moduleKey } });
    if (!module) return NextResponse.json({ error: 'Module introuvable' }, { status: 404 });
    if (module.isRequired && !enabled) {
      return NextResponse.json({ error: `Le module ${module.name} est obligatoire et ne peut pas être désactivé` }, { status: 400 });
    }

    // Vérifie les dépendances si on active
    if (enabled && module.dependencies) {
      const deps = module.dependencies.split(',').map((d) => d.trim());
      const enabledSet = await getEnabledModules(agencyId);
      for (const dep of deps) {
        if (!enabledSet.has(dep)) {
          return NextResponse.json({ error: `Dépendance manquante: ${dep}` }, { status: 400 });
        }
      }
    }

    await setModuleEnabled(agencyId, moduleKey, enabled, config);
    invalidateModuleCache(agencyId);

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('[modules/tenant PATCH] Error:', e);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
