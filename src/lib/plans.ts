/**
 * Helper Plans & Subscriptions (PRD §12.6)
 *
 * - getAgencySubscription(agencyId): Plan + limites
 * - checkPlanLimit(agencyId, type): boolean
 * - assignPlanToAgency(agencyId, planId, billingCycle)
 * - getAllPlans(): catalogue
 */

import { db } from '@/lib/db';

const cache = new Map<string, { data: PlanInfo | null; expiry: number }>();
const CACHE_TTL = 60_000;

export interface PlanInfo {
  planId: string;
  planName: string;
  badge: string | null;
  status: string;
  maxProperties: number;
  maxQRCodes: number;
  maxUsers: number;
  includedModules: string[] | null; // null = tous
  endDate: Date | null;
}

/**
 * Récupère l'abonnement actif d'un tenant avec les limites du plan.
 * Si pas d'abonnement → retourne null (accès limité aux modules requis).
 */
export async function getAgencySubscription(agencyId: string): Promise<PlanInfo | null> {
  const cached = cache.get(agencyId);
  if (cached && cached.expiry > Date.now()) return cached.data;

  const sub = await db.subscription.findUnique({
    where: { agencyId },
    include: { plan: true },
  });

  let result: PlanInfo | null = null;
  if (sub && sub.status !== 'cancelled' && sub.status !== 'expired') {
    result = {
      planId: sub.planId,
      planName: sub.plan.name,
      badge: sub.plan.badge,
      status: sub.status,
      maxProperties: sub.plan.maxProperties,
      maxQRCodes: sub.plan.maxQRCodes,
      maxUsers: sub.plan.maxUsers,
      includedModules: sub.plan.includedModules ? JSON.parse(sub.plan.includedModules) : null,
      endDate: sub.endDate,
    };
  }

  cache.set(agencyId, { data: result, expiry: Date.now() + CACHE_TTL });
  return result;
}

/**
 * Vérifie si une limite de plan est respectée.
 * type: 'properties' | 'qrcodes' | 'users'
 */
export async function checkPlanLimit(
  agencyId: string,
  type: 'properties' | 'qrcodes' | 'users'
): Promise<{ allowed: boolean; current: number; max: number; planName: string | null }> {
  const sub = await getAgencySubscription(agencyId);

  // Si pas d'abonnement → on permet 1 propriété par défaut (mode trial)
  if (!sub) {
    if (type === 'properties') {
      const count = await countUserAgencies(agencyId);
      return { allowed: count < 1, current: count, max: 1, planName: null };
    }
    return { allowed: true, current: 0, max: 999, planName: null };
  }

  let max: number;
  let current: number;
  switch (type) {
    case 'properties':
      max = sub.maxProperties;
      current = await countUserAgencies(agencyId);
      break;
    case 'qrcodes':
      max = sub.maxQRCodes;
      current = await db.baggage.count({ where: { agencyId } });
      break;
    case 'users':
      max = sub.maxUsers;
      current = await db.user.count({ where: { agencyId } });
      break;
  }

  return { allowed: current < max, current, max, planName: sub.planName };
}

/**
 * Compte combien d'agences appartiennent au même propriétaire.
 * Pour l'instant, on compte les agences créées par duplication
 * (les agences liées au même user via user.agencyId).
 */
async function countUserAgencies(agencyId: string): Promise<number> {
  // Récupère le user propriétaire de cette agence
  const user = await db.user.findFirst({
    where: { agencyId },
    select: { id: true },
  });
  if (!user) return 1;
  // Compte les agences créées par ce user (via le champ createdById si existant)
  // Pour l'instant, on compte les subscriptions liées au même email propriétaire
  // Simplification: 1 agence = 1 propriété (le mode multi-property light via duplication)
  const agencies = await db.agency.count({
    where: { users: { some: { id: user.id } } },
  });
  return agencies || 1;
}

/**
 * Assigne un plan à un tenant (crée ou met à jour la subscription).
 */
export async function assignPlanToAgency(
  agencyId: string,
  planId: string,
  billingCycle: 'monthly' | 'yearly' = 'monthly',
  trialDays = 0
): Promise<void> {
  const plan = await db.plan.findUnique({ where: { id: planId } });
  if (!plan) throw new Error('Plan introuvable');

  const amountPaid = billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + (billingCycle === 'yearly' ? 365 : 30));

  const trialEndsAt = trialDays > 0
    ? new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000)
    : null;

  await db.subscription.upsert({
    where: { agencyId },
    create: {
      agencyId,
      planId,
      status: trialDays > 0 ? 'trial' : 'active',
      billingCycle,
      autoRenew: true,
      amountPaid,
      endDate,
      trialEndsAt,
    },
    update: {
      planId,
      status: trialDays > 0 ? 'trial' : 'active',
      billingCycle,
      autoRenew: true,
      amountPaid,
      endDate,
      trialEndsAt,
    },
  });

  // Applique les modules inclus par le plan
  const includedModules = plan.includedModules ? JSON.parse(plan.includedModules) : null;
  if (includedModules) {
    // Désactive tous les modules non inclus
    const allModules = await db.module.findMany({ where: { isActive: true }, select: { key: true } });
    for (const m of allModules) {
      const shouldBeEnabled = includedModules.includes(m.key);
      // Upsert tenantModule
      await db.tenantModule.upsert({
        where: { agencyId_moduleKey: { agencyId, moduleKey: m.key } },
        create: { agencyId, moduleKey: m.key, enabled: shouldBeEnabled },
        update: { enabled: shouldBeEnabled },
      });
    }
  }

  cache.delete(agencyId);
}

/**
 * Récupère tous les plans disponibles.
 */
export async function getAllPlans() {
  return db.plan.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  });
}

export function invalidateSubscriptionCache(agencyId: string): void {
  cache.delete(agencyId);
}
