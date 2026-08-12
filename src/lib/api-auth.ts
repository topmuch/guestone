/**
 * Helper d'authentification pour les routes API.
 *
 * Usage:
 *   import { requireSuperadmin, requireAgencyStaff, requireAgencyOwner } from '@/lib/api-auth';
 *
 *   export async function GET(req: NextRequest) {
 *     const auth = await requireSuperadmin();
 *     if (!auth.ok) return auth.response;
 *     const user = auth.user;
 *     ...
 *   }
 */

import type { NextResponse } from 'next/server';

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  agencyId: string | null;
}

export interface AuthResult {
  ok: boolean;
  user?: SessionUser;
  response?: NextResponse;
}

/**
 * Vérifie que l'utilisateur est connecté (n'importe quel rôle).
 */
export async function requireAuth(): Promise<AuthResult> {
  try {
    const { getSession } = await import('@/lib/session');
    const user = await getSession();
    if (!user) {
      return {
        ok: false,
        response: NextResponse.json({ error: 'Non authentifié' }, { status: 401 }),
      };
    }
    return { ok: true, user };
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Erreur de session' }, { status: 500 }),
    };
  }
}

/**
 * Vérifie que l'utilisateur est superadmin ou admin.
 */
export async function requireSuperadmin(): Promise<AuthResult> {
  const auth = await requireAuth();
  if (!auth.ok) return auth;
  if (auth.user!.role !== 'superadmin' && auth.user!.role !== 'admin') {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Accès refusé — admin requis' }, { status: 403 }),
    };
  }
  return auth;
}

/**
 * Vérifie que l'utilisateur est staff d'agence (role = agency).
 */
export async function requireAgencyStaff(): Promise<AuthResult> {
  const auth = await requireAuth();
  if (!auth.ok) return auth;
  if (auth.user!.role !== 'agency' || !auth.user!.agencyId) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Accès refusé — staff agence requis' }, { status: 403 }),
    };
  }
  return auth;
}

/**
 * Vérifie que l'utilisateur appartient à l'agence spécifiée (anti-IDOR).
 * Utilisé pour les routes /api/agency/* qui reçoivent agencyId en paramètre.
 */
export async function requireAgencyAccess(targetAgencyId: string): Promise<AuthResult> {
  const auth = await requireAuth();
  if (!auth.ok) return auth;

  // Superadmin peut tout accéder
  if (auth.user!.role === 'superadmin' || auth.user!.role === 'admin') {
    return auth;
  }

  // Agency staff ne peut accéder qu'à sa propre agence
  if (auth.user!.role !== 'agency' || auth.user!.agencyId !== targetAgencyId) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Accès refusé — agence incorrecte' }, { status: 403 }),
    };
  }
  return auth;
}

/**
 * Vérifie un secret cron (header Authorization: Bearer <secret>).
 * CRON_SECRET doit être configuré — pas de fallback.
 */
export function requireCronSecret(req: Request): { ok: boolean; response?: NextResponse } {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'CRON_SECRET non configuré' }, { status: 500 }),
    };
  }
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${cronSecret}`) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Non autorisé' }, { status: 401 }),
    };
  }
  return { ok: true };
}
