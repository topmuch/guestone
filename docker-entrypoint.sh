#!/bin/sh
# ════════════════════════════════════════════════════════════════════
# Guest One — docker-entrypoint.sh
# Exécuté à chaque démarrage du container (PID 1 via Docker ENTRYPOINT).
#
# Étapes (toutes idempotentes / non-fatales sauf la DB) :
#   1. Prépare les dossiers persistants (/app/data, /app/public/uploads)
#   2. pousse le schéma Prisma vers SQLite (prisma db push)
#   3. Lance les seeds idempotents (catalogues de référence)
#   4. Crée / met à jour le superadmin
#   5. exec node server.js  ← devient PID 1 (reçoit les signaux SIGTERM)
# ════════════════════════════════════════════════════════════════════
set -e

echo "═══════════════════════════════════════════════════════════════"
echo "  Guest One — démarrage du container"
echo "  NODE_ENV=$NODE_ENV  PORT=$PORT  HOSTNAME=$HOSTNAME"
echo "  DATABASE_URL=$DATABASE_URL"
echo "═══════════════════════════════════════════════════════════════"

# ─── 1. Dossiers persistants ─────────────────────────────────────────
mkdir -p /app/data /app/public/uploads
echo "✓ Dossiers persistants prêts (/app/data, /app/public/uploads)"

# ─── 2. Schéma base de données (FATAL si échec) ─────────────────────
# Utilise le binaire local (pas npx → pas de download réseau au boot).
echo "→ Initialisation du schéma SQLite (prisma db push)..."
if ! ./node_modules/.bin/prisma db push \
        --schema=./prisma/schema.prisma \
        --skip-generate \
        --accept-data-loss; then
    echo "❌ ERREUR: prisma db push a échoué — vérifiez DATABASE_URL et les permissions sur /app/data"
    exit 1
fi
echo "✓ Schéma DB à jour"

# ─── 3. Seeds idempotents (non-fataux) ──────────────────────────────
# Chaque seed vérifie l'existence avant d'insérer → safe au restart.
# `|| true` : un seed qui échoue ne fait pas crasher le container.
echo "→ Seeds de référence (idempotents)..."

run_seed() {
    name="$1"
    script="$2"
    if [ -f "$script" ]; then
        echo "  • $name..."
        node "$script" 2>&1 | sed 's/^/      /' || echo "      (ignoré)"
    else
        echo "  • $name : script absent ($script), ignoré"
    fi
}

run_seed "Catalogue services hôtel"   scripts/seed-services.cjs
run_seed "Catalogue services Airbnb"  scripts/seed-airbnb-services.cjs
run_seed "Modèles appareils"          scripts/seed-modeles-appareils.cjs
run_seed "Modules"                    scripts/seed-modules.cjs
run_seed "Plans tarifaires"           scripts/seed-plans.cjs
run_seed "Superadmin"                 scripts/create-admin.cjs
run_seed "Données démo"               scripts/seed-demo.cjs

echo "✓ Seeds terminés"

# ─── 4. Vérification des secrets critiques (warning, non fatal) ─────
warn_secret() {
    var="$1"
    val=$(eval "echo \$$var")
    case "$val" in
        ""|change-me*|generer-*|admin123)
            echo "⚠️  AVERTISSEMENT: $var n'est pas configuré (valeur par défaut). À définir dans Coolify."
            ;;
    esac
}
warn_secret NEXTAUTH_SECRET
warn_secret ENCRYPTION_KEY
warn_secret CRON_SECRET

# ─── 5. Démarrage du serveur Next.js ─────────────────────────────────
# `exec` remplace le shell courant : node devient PID 1 et reçoit
# proprement les signaux SIGTERM/SIGINT de Docker/Coolify (graceful shutdown).
echo "→ Démarrage du serveur Next.js (standalone)..."
echo "═══════════════════════════════════════════════════════════════"
exec "$@"
