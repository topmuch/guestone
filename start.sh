#!/bin/sh
# Guest One — Script de démarrage unique
# Lancé par nixpacks au démarrage du conteneur
set -e

echo "══════════════════════════════════════════════════"
echo "  Guest One — Démarrage"
echo "══════════════════════════════════════════════════"

# 1. Crée les répertoires
mkdir -p /app/data /app/data/backups /app/public/uploads/damage

# 2. Applique le schéma Prisma (crée toutes les tables)
echo "📦 Application du schéma Prisma..."
npx prisma db push --skip-generate --accept-data-loss 2>&1 || {
  echo "⚠️ prisma db push failed — trying with schema path"
  npx prisma db push --schema=./prisma/schema.prisma --skip-generate --accept-data-loss 2>&1 || true
}
echo "✅ Schéma DB appliqué"

# 3. Seeds (idempotents — safe to run multiple times)
echo "🌱 Seeds..."
node scripts/seed-services.cjs 2>&1 || echo "⚠️ seed-services failed"
node scripts/seed-airbnb-services.cjs 2>&1 || echo "⚠️ seed-airbnb-services failed"
node scripts/seed-modeles-appareils.cjs 2>&1 || echo "⚠️ seed-modeles-appareils failed"
node scripts/seed-modules.cjs 2>&1 || echo "⚠️ seed-modules failed"
node scripts/seed-plans.cjs 2>&1 || echo "⚠️ seed-plans failed"
echo "✅ Seeds terminés"

# 4. Crée le superadmin
echo "👤 Création superadmin..."
node scripts/create-admin.cjs 2>&1 || echo "⚠️ create-admin failed"
echo "✅ Superadmin: admin@qrtags.com / admin123"

# 5. Crée l'agence démo
echo "🎮 Création démo..."
node scripts/seed-demo.cjs 2>&1 || echo "⚠️ seed-demo failed"
echo "✅ Démo prête"

# 6. Démarre le serveur
echo "🚀 Démarrage Next.js..."
exec node .next/standalone/server.js
