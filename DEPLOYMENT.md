# Guest One — Guide de déploiement Coolify (Dockerfile)

Ce guide décrit le déploiement **via Dockerfile** (recommandé) sur Coolify.
Le fichier `nixpacks.toml` a été désactivé (`nixpacks.toml.disabled`) pour forcer Coolify à utiliser le `Dockerfile`.

---

## 🏗️ Architecture du build

Le `Dockerfile` est multi-stage (3 étapes) :

| Stage | Rôle | Image de base |
|-------|------|---------------|
| **deps** | Installe toutes les dépendances npm + génère le client Prisma (avec binary targets Linux) | `node:20-slim` + python/make/g++ |
| **builder** | Compile Next.js en mode `standalone` + copie `public/`, `prisma/`, `scripts/`, `node_modules/` à côté de `server.js` | `node:20-slim` |
| **runner** | Image runtime minimale (openssl, sqlite3, curl) + bundle standalone + entrypoint | `node:20-slim` |

**Avantages vs nixpacks :**
- ✅ Build reproductible et cacheable
- ✅ Client Prisma généré avec les bons binary targets Linux (`linux-debian-openssl-3.0.x`)
- ✅ `serverExternalPackages` (sharp, nodemailer, pdf-lib, qrcode, archiver) correctement inclus
- ✅ Seeds et migration DB gérés par `docker-entrypoint.sh` (idempotents)
- ✅ Utilisateur non-root (`nextjs:1001`)
- ✅ Healthcheck intégré
- ✅ Volumes persistants pour SQLite et uploads

---

## 🚀 Déploiement sur Coolify (5 minutes)

### 1. Connecter le repository

1. Coolify → **+ New Resource** → **Public Repository** (ou Private avec token)
2. Repository : `topmuch/guestone`
3. Branch : `main`
4. Coolify détecte automatiquement le `Dockerfile` (prioritaire sur nixpacks)

### 2. Configurer les variables d'environnement

Coolify → **Environment Variables**. Copiez le contenu de `.env.production.example`
et adaptez les valeurs :

```env
# ─── Core ───────────────────────────────────────────────────────────
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0
DATABASE_URL=file:/app/data/qrtags.db

# ─── URLs publiques (votre domaine Coolify) ─────────────────────────
NEXT_PUBLIC_BASE_URL=https://guestone.votre-domaine.com
NEXT_PUBLIC_APP_URL=https://guestone.votre-domaine.com
NEXTAUTH_URL=https://guestone.votre-domaine.com

# ─── Secrets [OBLIGATOIRE] ──────────────────────────────────────────
# Générez avec : openssl rand -base64 32
NEXTAUTH_SECRET=<généré>
ENCRYPTION_KEY=<généré>
CRON_SECRET=<généré>
```

### 3. Configurer les volumes persistants

Coolify → **Persistent Storage (Volumes)** :

| Path | Description | Obligatoire |
|------|-------------|-------------|
| `/app/data` | Base SQLite `qrtags.db` + backups | ✅ |
| `/app/public/uploads` | Photos et fichiers uploadés | ✅ (si uploads utilisés) |

> ⚠️ Sans le volume `/app/data`, la base SQLite est **perdue à chaque redéploiement**.

### 4. Configurer le port et le domaine

- Coolify → **Ports** : `3000` (exposé par le Dockerfile)
- Coolify → **Domains** : ajoutez votre domaine (ex: `guestone.votre-domaine.com`)
- Coolify génère automatiquement le certificat SSL Let's Encrypt

### 5. Déployer

Cliquez **Deploy**. Le build prend ~3-5 minutes :

1. `npm ci --legacy-peer-deps` (stage deps)
2. `npx prisma generate` (stage deps)
3. `npm run build` → Next.js standalone (stage builder)
4. Copie du bundle standalone + node_modules + public (stage builder)
5. Au démarrage (stage runner) :
   - `mkdir -p /app/data /app/public/uploads`
   - `prisma db push` (crée/maj le schéma SQLite)
   - Seeds idempotents (services, modules, plans, superadmin, démo)
   - `exec node server.js`

---

## 🔑 Premier login

Après déploiement, allez sur `https://guestone.votre-domaine.com/login` :

- **Email** : `admin@qrtags.com`
- **Mot de passe** : `admin123`

⚠️ **Changez le mot de passe immédiatement** après la 1ère connexion !

---

## 🔍 Diagnostic des crashs (restart loop)

Si le container affiche **« Exited (10x restarts) »** :

### 1. Consulter les logs

Coolify → **Logs** (onglet du container). Les 50 dernières lignes avant le crash
contiennent l'erreur exacte. Le `docker-entrypoint.sh` affiche chaque étape :

```
→ Initialisation du schéma SQLite (prisma db push)...
✓ Schéma DB à jour
→ Seeds de référence (idempotents)...
  • Catalogue services hôtel...
→ Démarrage du serveur Next.js (standalone)...
```

### 2. Causes fréquentes

| Symptôme | Cause | Solution |
|----------|-------|----------|
| `prisma db push a échoué` | `DATABASE_URL` vide ou volume non monté | Vérifiez la variable + le volume `/app/data` |
| `Cannot find module 'sharp'` | node_modules mal copié | Rebuild sans cache : Coolify → **Rebuild (no cache)** |
| `EADDRINUSE :3000` | Port déjà utilisé | Vérifiez qu'aucun autre service n'utilise le port 3000 |
| `NEXTAUTH_SECRET` warning | Secret par défaut | Définissez un vrai secret dans Coolify |
| Hydratation / 500 sur `/` | `NEXT_PUBLIC_APP_URL` incorrect | Doit matcher le domaine Coolify |

### 3. Terminal du container (debug avancé)

Coolify → **Terminal / Exec** dans le container :

```bash
# Vérifier la DB
sqlite3 /app/data/qrtags.db ".tables"

# Relancer un seed manuellement
node scripts/seed-services.cjs

# Reset complet de la DB (⚠️ supprime les données)
rm -f /app/data/qrtags.db /app/data/qrtags.db-journal
# Puis Coolify → Restart
```

---

## ⏰ Cron jobs (optionnel)

Le `instrumentation.ts` lance déjà en arrière-plan (in-process) :
- Escalade auto (toutes les 5 min)
- PMS sync (toutes les 30 min)
- Demo reset (toutes les heures)

Pour le **auto-checkout** (expire les QR dont la `departureDate` est dépassée),
ajoutez une tâche planifiée dans Coolify → **Scheduled Tasks** :

- **Command** : `curl -X POST http://localhost:3000/api/cron/auto-checkout -H "Authorization: Bearer ${CRON_SECRET}"`
- **Frequency** : `0 * * * *` (toutes les heures)

---

## 🔄 Mises à jour

Pour déployer une nouvelle version :

1. `git push` sur la branche `main`
2. Coolify détecte le push → **Deploy** automatique (si auto-deploy activé)
3. Le volume `/app/data` est préservé → vos données SQLite sont conservées

Pour un **rebuild sans cache** (en cas de souci) :
Coolify → **Deploy** → choisir **Rebuild without cache**

---

## 📦 Build local (test)

```bash
# Build
docker build -t guestone .

# Run avec volume
docker run -d \
  --name guestone \
  -p 3000:3000 \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/uploads:/app/public/uploads \
  -e NEXTAUTH_SECRET=$(openssl rand -base64 32) \
  -e ENCRYPTION_KEY=$(openssl rand -base64 32) \
  -e NEXT_PUBLIC_BASE_URL=http://localhost:3000 \
  -e NEXT_PUBLIC_APP_URL=http://localhost:3000 \
  -e NEXTAUTH_URL=http://localhost:3000 \
  guestone

# Logs
docker logs -f guestone

# Healthcheck
curl http://localhost:3000/api
```

---

## 🗄️ Sauvegarde / restauration DB

### Backup manuel

```bash
# Via Coolify Exec ou en local
sqlite3 /app/data/qrtags.db ".backup /app/data/backup-$(date +%Y%m%d).db"
```

### Via l'API (si CRON_BACKUP_ENABLED=true)

```bash
curl -X POST https://guestone.votre-domaine.com/api/cron/backup-db \
  -H "Authorization: Bearer ${CRON_BACKUP_SECRET}"
```

### Reset complet (⚠️ supprime toutes les données)

```bash
# Coolify → Exec
rm -f /app/data/qrtags.db /app/data/qrtags.db-journal
# Puis Coolify → Restart (la DB est recréée + reseed au démarrage)
```
