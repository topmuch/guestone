import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware de protection des routes serveur.
 *
 * Vérifie la présence du cookie de session pour /admin/* et /agence/*.
 * Les routes API vérifient ensuite le rôle via getSession() côté handler.
 *
 * Note: ce middleware ne fait PAS la vérification du rôle (superadmin vs agency)
 * car cela nécessiterait une requête DB à chaque requête. Il vérifie juste
 * qu'un cookie de session existe. La vérification fine du rôle est faite
 * par les API elles-mêmes via getSession().
 */

const SESSION_COOKIE_NAME = 'qrbag_session';

// Routes publiques (pas besoin de session)
const PUBLIC_ROUTES = [
  '/admin/connexion',
  '/admin/login',
  '/agence/connexion',
  '/agence/login',
  '/login',
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Routes API d'auth — toujours autorisées
  if (pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }

  // Routes publiques (pages de login)
  if (PUBLIC_ROUTES.some((route) => pathname === route)) {
    return NextResponse.next();
  }

  // Routes protégées: /admin/* et /agence/*
  if (pathname.startsWith('/admin/') || pathname.startsWith('/agence/')) {
    const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionCookie) {
      // Pas de cookie → redirige vers login
      if (pathname.startsWith('/admin/')) {
        return NextResponse.redirect(new URL('/admin/connexion', req.url));
      }
      return NextResponse.redirect(new URL('/agence/connexion', req.url));
    }

    // Cookie présent → on laisse passer (la vérification fine du rôle
    // est faite par les API via getSession())
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/agence/:path*',
    '/login',
  ],
};
