FROM node:20-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    git sqlite3 ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN git clone https://github.com/topmuch/guestone.git .

RUN rm -rf node_modules package-lock.json
RUN npm cache clean --force
RUN npm install --legacy-peer-deps --no-audit --no-fund

RUN npx prisma generate

ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL=file:/tmp/build.db
ENV NODE_OPTIONS="--max-old-space-size=4096"
ENV NEXT_TYPESCRIPT_CHECK=false
RUN npm run build

RUN cp -r .next/static .next/standalone/.next/ && \
    cp -r public .next/standalone/public && \
    cp -r node_modules .next/standalone/node_modules && \
    cp -r prisma .next/standalone/prisma && \
    cp -r scripts .next/standalone/scripts && \
    cp package.json .next/standalone/package.json

RUN mkdir -p /app/data

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV DATABASE_URL=file:/app/data/qrtags.db

WORKDIR /app/.next/standalone

# 1. prisma db push (crée tables)
# 2. seeds (catalogue services + modules + plans + appareils)
# 3. create superadmin (admin@qrtags.com / admin123)
# 4. start server
CMD sh -c "npx prisma db push --skip-generate --accept-data-loss 2>&1; \
  node scripts/seed-services.cjs 2>&1 || true; \
  node scripts/seed-airbnb-services.cjs 2>&1 || true; \
  node scripts/seed-modeles-appareils.cjs 2>&1 || true; \
  node scripts/seed-modules.cjs 2>&1 || true; \
  node scripts/seed-plans.cjs 2>&1 || true; \
  node scripts/create-admin.cjs 2>&1 || true; \
  node server.js"
