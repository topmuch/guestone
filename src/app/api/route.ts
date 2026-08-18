import { NextResponse } from "next/server";

/**
 * Healthcheck endpoint — used by Docker/Coolify HEALTHCHECK.
 * Verifies DB connectivity + basic server health.
 * curl -f http://localhost:3000/api → 200 if OK, 503 if DB down.
 */
export async function GET() {
  try {
    // Dynamic import to avoid loading Prisma at build time
    const { db } = await import('@/lib/db');
    // Quick DB connectivity check
    await db.$queryRaw`SELECT 1`;
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      db: 'connected',
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      db: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown DB error',
    }, { status: 503 });
  }
}
