import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/audit-logs?level=xxx&source=xxx&limit=100
 * Récupère les logs d'audit (superadmin only)
 */
export async function GET(req: NextRequest) {
  try {
    const { getSession } = await import('@/lib/session');
    const user = await getSession();
    if (!user || (user.role !== 'superadmin' && user.role !== 'admin')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const level = searchParams.get('level');
    const source = searchParams.get('source');
    const limit = Math.min(parseInt(searchParams.get('limit') || '200', 10), 500);

    const where: Record<string, unknown> = {};
    if (level && level !== 'all') where.level = level;
    if (source && source !== 'all') where.source = { contains: source };

    const logs = await db.systemLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    // Stats par niveau
    const stats = {
      total: logs.length,
      info: logs.filter((l) => l.level === 'info').length,
      warn: logs.filter((l) => l.level === 'warn').length,
      error: logs.filter((l) => l.level === 'error').length,
      fatal: logs.filter((l) => l.level === 'fatal').length,
    };

    // Sources uniques pour filtre
    const sources = await db.systemLog.findMany({
      distinct: ['source'],
      select: { source: true },
      take: 50,
    });

    return NextResponse.json({ success: true, logs, stats, sources: sources.map((s) => s.source) });
  } catch (error) {
    console.error('[api/audit-logs GET] Error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

/**
 * POST /api/audit-logs — enregistre une action (helper public)
 * Body: { level, message, source, metadata? }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { level, message, source, metadata } = body;

    if (!level || !message || !source) {
      return NextResponse.json({ error: 'level, message, source requis' }, { status: 400 });
    }

    const log = await db.systemLog.create({
      data: {
        level,
        message,
        source,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });

    return NextResponse.json({ success: true, logId: log.id });
  } catch (error) {
    console.error('[api/audit-logs POST] Error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
