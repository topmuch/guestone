/**
 * Helper Web Push Notifications (V3)
 *
 * - subscribeUser(userId, agencyId, subscription): enregistre l'abonnement push
 * - sendPushToAgency(agencyId, payload): envoie une notif à tous les staff d'une agence
 * - sendPushToUser(userId, payload): envoie une notif à un user spécifique
 *
 * Utilise web-push si VAPID_KEYS configuré, sinon fallback email.
 */

import { db } from '@/lib/db';

// VAPID keys (à générer une fois avec web-push generate-vapid-keys)
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:contact@guestone.com';

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: Record<string, unknown>;
  tag?: string;
  url?: string;
}

/**
 * Enregistre un abonnement push pour un utilisateur.
 */
export async function subscribeUser(
  userId: string,
  agencyId: string | null,
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
  userAgent?: string
): Promise<void> {
  await db.pushSubscription.upsert({
    where: { endpoint: subscription.endpoint },
    create: {
      userId,
      agencyId,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      userAgent: userAgent || null,
    },
    update: {
      userId,
      agencyId,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
  });
}

/**
 * Envoie une notification push à tous les staff d'une agence.
 */
export async function sendPushToAgency(agencyId: string, payload: PushPayload): Promise<number> {
  const subs = await db.pushSubscription.findMany({
    where: { agencyId },
  });
  if (subs.length === 0) return 0;

  let sent = 0;
  if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
    try {
      const webpush = (await import('web-push')).default;
      webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

      const promises = subs.map((sub) =>
        webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          JSON.stringify(payload)
        ).then(() => { sent++; })
          .catch((e) => {
            console.error('[push] send failed:', e.statusCode);
            // Si 410 Gone → supprime l'abonnement
            if (e.statusCode === 410 || e.statusCode === 404) {
              db.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
            }
          })
      );
      await Promise.all(promises);
    } catch (e) {
      console.error('[push] web-push not available:', e);
    }
  }
  return sent;
}

/**
 * Envoie une notification push à un utilisateur spécifique.
 */
export async function sendPushToUser(userId: string, payload: PushPayload): Promise<number> {
  const subs = await db.pushSubscription.findMany({
    where: { userId },
  });
  if (subs.length === 0) return 0;

  let sent = 0;
  if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
    try {
      const webpush = (await import('web-push')).default;
      webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

      const promises = subs.map((sub) =>
        webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          JSON.stringify(payload)
        ).then(() => { sent++; })
          .catch(() => {})
      );
      await Promise.all(promises);
    } catch (e) {
      console.error('[push] web-push not available:', e);
    }
  }
  return sent;
}

/**
 * Retourne la clé publique VAPID pour le client.
 */
export function getVapidPublicKey(): string {
  return VAPID_PUBLIC_KEY;
}
