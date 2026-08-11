import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/payments/webhook — Stripe webhook
 *
 * Reçoit les événements Stripe (payment succeeded, failed, etc.)
 * et met à jour le statut des paiements en DB.
 *
 * Headers: Stripe-Signature
 */
export async function POST(req: NextRequest) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!stripeSecretKey || !webhookSecret) {
      // Stripe non configuré — on ignore
      return NextResponse.json({ received: true, mode: 'offline' });
    }

    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Signature manquante' }, { status: 400 });
    }

    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(stripeSecretKey);

    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('[payments/webhook] Signature verification failed:', err);
      return NextResponse.json({ error: 'Signature invalide' }, { status: 400 });
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        console.log('[payments/webhook] Payment succeeded:', session.id);
        // TODO: mettre à jour le paiement en DB + déclencher actions
        // (confirmer commande, activer abonnement, etc.)
        break;
      }
      case 'payment_intent.payment_failed': {
        const intent = event.data.object;
        console.log('[payments/webhook] Payment failed:', intent.id);
        break;
      }
      default:
        // Événement non géré
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[api/payments/webhook] Error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
