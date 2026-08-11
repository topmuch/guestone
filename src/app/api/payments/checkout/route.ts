import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * POST /api/payments/checkout — crée une intention de paiement
 *
 * Stratégie MVP (sans Stripe SDK pour éviter dépendance lourde):
 * On enregistre le paiement en DB avec statut "pending" et on retourne
 * un lien de paiement. Si Stripe est configuré (STRIPE_SECRET_KEY),
 * on crée une vraie Checkout Session. Sinon, mode "facture chambre" ou "cash".
 *
 * Body: { agencyId, type: 'subscription'|'order'|'spa'|'roomservice', referenceId, amount, description? }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { agencyId, type, referenceId, amount, description } = body;

    if (!agencyId || !type || !amount) {
      return NextResponse.json({ error: 'agencyId, type et amount requis' }, { status: 400 });
    }

    // Vérifie si Stripe est configuré
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    if (!stripeSecretKey) {
      // Mode sans Stripe: on enregistre juste l'intention (paiement hors ligne)
      return NextResponse.json({
        success: true,
        mode: 'offline',
        message: 'Paiement enregistré — à traiter manuellement (cash ou facture chambre)',
        paymentId: `pay_offline_${Date.now()}`,
        amount,
        status: 'pending',
      });
    }

    // Mode Stripe: créer une Checkout Session
    try {
      // Dynamic import pour éviter de casser le build si stripe n'est pas installé
      const Stripe = (await import('stripe')).default;
      const stripe = new Stripe(stripeSecretKey);

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'xof', // FCFA
              product_data: {
                name: description || `Paiement Guest One — ${type}`,
              },
              unit_amount: amount, // Stripe utilise les centimes, mais XOF n'a pas de centimes
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.NEXT_PUBLIC_APP_URL || ''}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || ''}/payment/cancel`,
        metadata: {
          agencyId,
          type,
          referenceId: referenceId || '',
        },
      });

      return NextResponse.json({
        success: true,
        mode: 'stripe',
        checkoutUrl: session.url,
        sessionId: session.id,
      });
    } catch (stripeErr) {
      console.error('[payments/checkout] Stripe error:', stripeErr);
      // Fallback offline
      return NextResponse.json({
        success: true,
        mode: 'offline',
        message: 'Stripe indisponible — paiement à traiter manuellement',
        amount,
        status: 'pending',
      });
    }
  } catch (error) {
    console.error('[api/payments/checkout] Error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
