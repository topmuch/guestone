/**
 * Next.js Instrumentation — runs once when the server starts.
 * https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 *
 * On lance ici les tâches de fond (background jobs) qui doivent tourner
 * en permanence dans le process Next.js standalone:
 *
 *   1. Escalade auto — toutes les 5 min, vérifie les demandes "new" > 15 min
 *      et envoie un email consolidé à l'équipe direction.
 *
 * Avantage: aucun cron externe à configurer dans Coolify. Tout tourne in-process.
 */

export async function register() {
  // Ne lancer que sur le serveur (pas pendant le build)
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;
  if (process.env.NODE_ENV === 'production' || process.env.ENABLE_BACKGROUND_JOBS === '1') {
    console.log('[instrumentation] Démarrage tâches de fond...');
    startEscalationJob();
    startPmsSyncJob();
    startDemoResetJob();
  }
}

// ─── Escalade auto ──────────────────────────────────────────────────────
function startEscalationJob() {
  const POLL_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const INTERNAL_TOKEN = process.env.CRON_SECRET || 'internal-escalation-token';

  const runEscalation = async () => {
    try {
      // Appel interne au endpoint /api/cron/escalade
      const res = await fetch(`${APP_URL}/api/cron/escalade`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${INTERNAL_TOKEN}`,
          'Content-Type': 'application/json',
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.escalated > 0) {
          console.log(`[escalation] ${data.escalated} demande(s) escaladée(s)`);
        }
      }
    } catch (e) {
      // Silencieux — on ne crash pas le serveur pour ça
      console.error('[escalation] Error:', e instanceof Error ? e.message : e);
    }
  };

  // Première exécution après 30s (laisse le serveur démarrer)
  setTimeout(runEscalation, 30_000);
  // Puis toutes les 5 min
  setInterval(runEscalation, POLL_INTERVAL_MS);
  console.log(`[instrumentation] Escalade auto programmée (toutes ${POLL_INTERVAL_MS / 60000} min)`);
}

// ─── PMS Sync auto ──────────────────────────────────────────────────────
function startPmsSyncJob() {
  const SYNC_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const CRON_SECRET = process.env.CRON_SECRET || 'internal-escalation-token';

  const runPmsSync = async () => {
    try {
      // Récupère toutes les agences avec PMS configuré
      const { db } = await import('@/lib/db');
      const agencies = await db.agency.findMany({
        where: { pmsProvider: { not: null }, active: true },
        select: { id: true, name: true, pmsProvider: true },
      });

      for (const agency of agencies) {
        try {
          await fetch(`${APP_URL}/api/pms/sync?agencyId=${agency.id}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${CRON_SECRET}`,
              'Content-Type': 'application/json',
            },
          });
          console.log(`[pms-sync] ${agency.name} (${agency.pmsProvider}) synchronisé`);
        } catch (e) {
          console.error(`[pms-sync] ${agency.name} échec:`, e instanceof Error ? e.message : e);
        }
      }
    } catch (e) {
      console.error('[pms-sync] Error:', e instanceof Error ? e.message : e);
    }
  };

  // Première exécution après 2 min
  setTimeout(runPmsSync, 120_000);
  // Puis toutes les 30 min
  setInterval(runPmsSync, SYNC_INTERVAL_MS);
  console.log(`[instrumentation] PMS sync programmé (toutes ${SYNC_INTERVAL_MS / 60000} min)`);
}

// ─── Demo reset auto ────────────────────────────────────────────────────
function startDemoResetJob() {
  const RESET_INTERVAL_MS = 60 * 60 * 1000; // 1 heure
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const CRON_SECRET = process.env.CRON_SECRET || 'internal-escalation-token';

  const runDemoReset = async () => {
    try {
      await fetch(`${APP_URL}/api/demo/reset`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CRON_SECRET}`,
          'Content-Type': 'application/json',
        },
      });
      console.log('[demo-reset] Données démo réinitialisées');
    } catch (e) {
      console.error('[demo-reset] Error:', e instanceof Error ? e.message : e);
    }
  };

  // Première exécution après 5 min
  setTimeout(runDemoReset, 300_000);
  // Puis toutes les heures
  setInterval(runDemoReset, RESET_INTERVAL_MS);
  console.log(`[instrumentation] Demo reset programmé (toutes ${RESET_INTERVAL_MS / 60000} min)`);
}
