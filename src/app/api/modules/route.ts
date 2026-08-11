import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/modules — catalogue global (public pour superadmin)
export async function GET() {
  const modules = await db.module.findMany({
    where: { isActive: true },
    orderBy: [{ category: 'asc' }, { priority: 'asc' }],
  });
  return NextResponse.json({ success: true, modules });
}
