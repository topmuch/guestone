# ════════════════════════════════════════════════════════════════════
# Guest One — Dockerfile multi-stage pour Coolify
# Next.js 16 (standalone) + Prisma 6 + SQLite + sharp
# ════════════════════════════════════════════════════════════════════
# Build : docker build -t guestone .
# Run   : docker run -p 3000:3000 -v $(pwd)/data:/app/data guestone
# Coolify détecte ce Dockerfile automatiquement (prioritaire sur nixpacks.toml).
# ════════════════════════════════════════════════════════════════════

# ─── ARGS / LABELS ───────────────────────────────────────────────────
ARG NODE_VERSION=20
ARG BASE=node:${NODE_VERSION}-slim

# ════════════════════════════════════════════════════════════════════
# Stage 1 — deps : installe TOUTES les dépendances (prod + dev pour le build)
# On garde les binaires de build (python/make/g++) pour sharp et prisma.
# ════════════════════════════════════════════════════════════════════
FROM ${BASE} AS deps

# Dépendances système nécessaires à sharp, prisma, bcryptjs, pdfkit
RUN apt-get update && apt-get install -y --no-install-recommends \
        openssl \
        ca-certificates \
        python3 \
        make \
        g++ \
        libc6-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copie ONLY les fichiers de manifeste → cache Docker optimal
COPY package.json package-lock.json* bun.lock* ./
COPY prisma ./prisma

# Installe avec npm (le repo pousse package-lock.json). --legacy-peer-deps
# évite les conflits peer deps avec next-auth / react 19.
RUN npm ci --legacy-peer-deps --no-audit --no-fund \
    || npm install --legacy-peer-deps --no-audit --no-fund

# Génère le client Prisma (avec binary targets Linux définis dans schema.prisma)
RUN npx prisma generate

# ════════════════════════════════════════════════════════════════════
# Stage 2 — builder : compile l'app Next.js en mode standalone
# ════════════════════════════════════════════════════════════════════
FROM ${BASE} AS builder

RUN apt-get update && apt-get install -y --no-install-recommends \
        openssl \
        ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Récupère node_modules + prisma client depuis le stage deps
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma

# Copie le reste du code source
COPY . .

# Build Next.js (standalone). --no-lint car next.config.ts ne gère plus
# la clé `eslint` (déprécié Next.js 16). ignoreBuildErrors reste actif.
RUN npm run build

# ─── Prépare le bundle standalone final ──────────────────────────────
# Next.js standalone ne bundle PAS : public/, .next/static, node_modules
# des serverExternalPackages (sharp, nodemailer, pdf-lib, qrcode, archiver).
# On les copie manuellement à côté de server.js.
RUN cp -r .next/static .next/standalone/.next/ 2>/dev/null || true \
 && cp -r public        .next/standalone/public 2>/dev/null || true \
 && cp -r prisma        .next/standalone/prisma 2>/dev/null || true \
 && cp -r scripts       .next/standalone/scripts 2>/dev/null || true \
 && cp    package.json  .next/standalone/package.json 2>/dev/null || true

# node_modules complet : nécessaire car serverExternalPackages ne sont pas
# bundlés par Next. On copie tout (simple et fiable ; image ~500-700 MB).
RUN cp -r node_modules  .next/standalone/node_modules 2>/dev/null || true

# ════════════════════════════════════════════════════════════════════
# Stage 3 — runner : image runtime minimale
# ════════════════════════════════════════════════════════════════════
FROM ${BASE} AS runner

# Dépendances runtime : openssl (prisma/sqlite), sqlite3 (debug/admin),
# ca-certificates (HTTPS), curl (healthcheck).
RUN apt-get update && apt-get install -y --no-install-recommends \
        openssl \
        ca-certificates \
        sqlite3 \
        curl \
    && rm -rf /var/lib/apt/lists/*

# Utilisateur non-root pour la sécurité (Coolify compatible)
RUN groupadd --system --gid 1001 nodejs \
 && useradd  --system --uid 1001 --gid nodejs --create-home nextjs

WORKDIR /app

# ─── Variables d'environnement par défaut ────────────────────────────
# Coolify override ces valeurs via son panneau Environment Variables.
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL=file:/app/data/qrtags.db
ENV NEXT_PUBLIC_BASE_URL=http://localhost:3000
ENV NEXT_PUBLIC_APP_URL=http://localhost:3000
ENV NEXTAUTH_URL=http://localhost:3000
# Secrets : à OBLIGATOIREMENT surcharger dans Coolify
ENV NEXTAUTH_SECRET=change-me-32-chars-min
ENV ENCRYPTION_KEY=change-me-32-chars-min
ENV CRON_SECRET=change-me
ENV CRON_BACKUP_ENABLED=false
# Demo reset: désactivé par défaut en production (mettre 1 pour activer)
ENV ENABLE_DEMO_RESET=

# ─── Copie du bundle standalone ──────────────────────────────────────
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone/scripts ./scripts

# ─── Script d'entrée (init DB + seeds + start) ───────────────────────
COPY --chown=nextjs:nodejs docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# ─── Volumes persistants ─────────────────────────────────────────────
# /app/data       → base SQLite + backups (à mapper dans Coolify)
# /app/public/uploads → fichiers uploadés (photos, etc.)
RUN mkdir -p /app/data /app/public/uploads \
 && chown -R nextjs:nodejs /app/data /app/public/uploads
VOLUME ["/app/data", "/app/public/uploads"]

USER nextjs

EXPOSE 3000

# Healthcheck : l'API racine répond 200 si le serveur tourne.
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000/api || exit 1

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["node", "server.js"]
