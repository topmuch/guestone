import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * POST /api/feedback/complaint — client soumet formulaire privé (note basse)
 * Body: { feedbackId, agencyId, category, description, photoUrl?, urgency? }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { feedbackId, agencyId, category, description, photoUrl, urgency } = body;

    if (!feedbackId || !agencyId || !category || !description) {
      return NextResponse.json({ error: 'feedbackId, agencyId, category, description requis' }, { status: 400 });
    }

    // Vérifie que le feedback existe et appartient à l'agence
    const feedback = await db.feedback.findUnique({ where: { id: feedbackId } });
    if (!feedback || feedback.agencyId !== agencyId) {
      return NextResponse.json({ error: 'Feedback introuvable' }, { status: 404 });
    }

    // Crée la complaint
    const complaint = await db.complaint.create({
      data: {
        feedbackId,
        agencyId,
        category,
        description,
        photoUrl: photoUrl || null,
        urgency: urgency || 'normal',
        status: 'open',
      },
    });

    // Met à jour le feedback
    await db.feedback.update({
      where: { id: feedbackId },
      data: { status: 'new' },
    });

    // TODO: envoyer email alerte au manager

    return NextResponse.json({ success: true, complaintId: complaint.id });
  } catch (error) {
    console.error('[api/feedback/complaint POST] Error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

/**
 * PATCH /api/feedback/complaint — manager résout une complaint
 * Body: { id, status, resolution?, resolvedBy? }
 */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, resolution, resolvedBy } = body;
    if (!id || !status) return NextResponse.json({ error: 'id et status requis' }, { status: 400 });

    const data: Record<string, unknown> = { status };
    if (resolution) data.resolution = resolution;
    if (status === 'resolved' || status === 'closed') {
      data.resolvedAt = new Date();
      if (resolvedBy) data.resolvedBy = resolvedBy;
    }

    const complaint = await db.complaint.update({ where: { id }, data });

    // Si résolu, met à jour le feedback
    if (status === 'resolved' || status === 'closed') {
      await db.feedback.update({
        where: { id: complaint.feedbackId },
        data: { status: 'resolved', handledAt: new Date(), handledBy: resolvedBy || null },
      });
    }

    return NextResponse.json({ success: true, complaint });
  } catch (error) {
    console.error('[api/feedback/complaint PATCH] Error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
