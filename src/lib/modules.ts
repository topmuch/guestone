/**
 * Helper Module Activation Engine (PRD §19)
 *
 * 5 niveaux d'activation: Global → Plan → Tenant → Propriété → Séjour
 * Ce helper gère le niveau Tenant (le plus utilisé).
 *
 * Usage:
 *   import { isModuleEnabled, getEnabledModules } from '@/lib/modules';
 *   if (await isModuleEnabled(agencyId, 'room_service')) { ... }
 */

import { db } from '@/lib/db';

// Cache in-process (60s) — évite de requêter la DB à chaque appel API
const cache = new Map<string, { data: Set<string>; expiry: number }>();
const CACHE_TTL = 60_000;

/**
 * Retourne l'ensemble des clés de modules activés pour un tenant.
 * Si le tenant n'a aucune entrée TenantModule, on fallback sur defaultEnabled du catalogue.
 */
export async function getEnabledModules(agencyId: string): Promise<Set<string>> {
  const cacheKey = `agency:${agencyId}`;
  const cached = cache.get(cacheKey);
  if (cached && cached.expiry > Date.now()) return cached.data;

  // Récupère le catalogue global (modules actifs)
  const allModules = await db.module.findMany({
    where: { isActive: true },
    select: { key: true, defaultEnabled: true, isRequired: true },
  });

  // Récupère les activations du tenant
  const tenantModules = await db.tenantModule.findMany({
    where: { agencyId },
    select: { moduleKey: true, enabled: true },
  });
  const tenantMap = new Map(tenantModules.map((tm) => [tm.moduleKey, tm.enabled]));

  // Calcule l'ensemble final
  const enabled = new Set<string>();
  for (const m of allModules) {
    const tenantEnabled = tenantMap.get(m.key);
    // Si le tenant a une entrée → on prend sa valeur
    // Sinon → on prend defaultEnabled du catalogue
    // isRequired → toujours activé
    if (m.isRequired || tenantEnabled === true || (tenantEnabled === undefined && m.defaultEnabled)) {
      enabled.add(m.key);
    }
  }

  cache.set(cacheKey, { data: enabled, expiry: Date.now() + CACHE_TTL });
  return enabled;
}

/**
 * Vérifie si un module est activé pour un tenant.
 */
export async function isModuleEnabled(agencyId: string, moduleKey: string): Promise<boolean> {
  const enabled = await getEnabledModules(agencyId);
  return enabled.has(moduleKey);
}

/**
 * Invalide le cache pour un tenant (après modification).
 */
export function invalidateModuleCache(agencyId: string): void {
  cache.delete(`agency:${agencyId}`);
}

/**
 * Active ou désactive un module pour un tenant (upsert).
 */
export async function setModuleEnabled(
  agencyId: string,
  moduleKey: string,
  enabled: boolean,
  config?: Record<string, unknown>
): Promise<void> {
  await db.tenantModule.upsert({
    where: {
      agencyId_moduleKey: { agencyId, moduleKey },
    },
    create: {
      agencyId,
      moduleKey,
      enabled,
      config: config ? JSON.stringify(config) : null,
    },
    update: {
      enabled,
      ...(config !== undefined ? { config: JSON.stringify(config) } : {}),
    },
  });
  invalidateModuleCache(agencyId);
}

/**
 * Active automatiquement les modules par défaut pour un nouveau tenant,
 * basé sur son agencyType (hotel vs airbnb).
 */
export async function applyDefaultModulesForAgencyType(
  agencyId: string,
  agencyType: string
): Promise<void> {
  const isAirbnb = agencyType === 'airbnb';
  const allModules = await db.module.findMany({
    where: { isActive: true },
    select: { key: true, category: true, defaultEnabled: true, isRequired: true },
  });

  for (const m of allModules) {
    // Pour un Airbnb: on désactive les modules hôtel par défaut
    // Pour un hôtel: on désactive les modules airbnb par défaut
    let enabled = m.isRequired || m.defaultEnabled;
    if (isAirbnb && m.category === 'hotel' && !m.isRequired) enabled = false;
    if (!isAirbnb && m.category === 'airbnb' && !m.isRequired) enabled = false;

    await db.tenantModule.upsert({
      where: {
        agencyId_moduleKey: { agencyId, moduleKey: m.key },
      },
      create: { agencyId, moduleKey: m.key, enabled },
      update: {}, // ne touche pas si existe déjà
    });
  }
  invalidateModuleCache(agencyId);
}
