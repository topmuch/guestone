import { NextResponse } from 'next/server';

/**
 * /api/init-demo — DÉSACTIVÉ pour sécurité.
 *
 * Cet endpoint créait publiquement le superadmin avec un mot de passe par défaut
 * et le renvoyait en clair dans la réponse JSON. C'était une faille critique.
 *
 * Le superadmin est maintenant créé au démarrage via docker-entrypoint.sh
 * (ou manuellement via `node scripts/create-admin.cjs`).
 *
 * Cet endpoint retourne 404 pour éviter toute utilisation.
 */
export async function GET() {
  return NextResponse.json(
    { error: 'Endpoint désactivé. Le superadmin est créé au démarrage du serveur.' },
    { status: 404 }
  );
}

export async function POST() {
  return NextResponse.json(
    { error: 'Endpoint désactivé. Le superadmin est créé au démarrage du serveur.' },
    { status: 404 }
  );
}
