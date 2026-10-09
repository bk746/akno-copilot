# AKNO Copilot

Espace client AKNO — statistiques réelles (Next.js 16, Supabase Auth, Vercel).

## Commandes

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm start
```

## 1. Base Supabase

1. Créer un projet sur [supabase.com](https://supabase.com) (offre gratuite).
2. **SQL Editor** → exécuter [`supabase/migrations/001_init.sql`](supabase/migrations/001_init.sql) puis [`002_passcode.sql`](supabase/migrations/002_passcode.sql).
3. Vérifier le site seed `site_akno` (akno.fr).

### Te mettre admin + accès au site AKNO

1. Copier `.env.example` → `.env.local` et renseigner Supabase + `ADMIN_EMAILS=ton@email.fr`.
2. Lancer l’app, aller sur `/login`, se connecter par magic link.
3. Dans Supabase **Authentication → Users**, copier ton `user_id`.
4. SQL Editor :

```sql
insert into public.site_members (user_id, site_id, role)
select '<TON_USER_UUID>', id, 'owner'
from public.sites where public_id = 'site_akno'
on conflict do nothing;
```

5. Ouvrir `/admin` pour gérer les clients et lancer « Actualiser maintenant ».

### Magic link (local)

1. `.env.local` : `NEXT_PUBLIC_APP_URL=http://localhost:3000` et la **vraie** URL projet (`https://<ref>.supabase.co`, pas un placeholder).
2. Supabase **Authentication → URL Configuration** :
   - **Site URL** : `http://localhost:3000`
   - **Redirect URLs** : `http://localhost:3000/auth/callback`
3. L’utilisateur doit **déjà exister** dans Auth (invitation admin ou création manuelle) — l’app envoie l’OTP avec `shouldCreateUser: false`.
4. L’OTP est demandé **dans le navigateur** (`createBrowserClient`) pour que le flux PKCE enregistre le verifier en cookies ; le callback serveur fait `exchangeCodeForSession`.
5. En cas d’échec à l’envoi, le message Supabase s’affiche sur `/login` ; le callback logue `[auth/callback]`.

## 2. Variables Vercel / `.env.local`

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé anon (client) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Serveur uniquement** — collect, crons, admin |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | JSON compte de service GSC encodé **base64** |
| `PAGESPEED_API_KEY` | API PageSpeed Insights |
| `ADMIN_EMAILS` | Emails admin séparés par des virgules |
| `CRON_SECRET` | Secret long (Authorization Bearer pour crons) |
| `PASSCODE_SECRET` | Secret HMAC cookie de déverrouillage (≥ 32 caractères) |
| `PASSCODE_ENABLED` | `true` par défaut ; `false` désactive la redirection `/lock` |
| `NEXT_PUBLIC_APP_URL` | `https://copilot.akno.fr` |

Aucune clé secrète n’est exposée au navigateur.

## 3. Script de suivi (akno.fr)

```html
<script defer src="https://copilot.akno.fr/t.js" data-site="site_akno"></script>
```

- Sans cookies · hash visiteur côté serveur (RGPD, pas de bandeau).
- Exclure tes visites : `?akno_ignore=1` (stocké en `localStorage`).

Fichier : [`public/t.js`](public/t.js) (~2 Ko).

## 4. Routes principales

| Route | Contenu |
|-------|---------|
| `/` | Accueil (overview) |
| `/trafic` | Visiteurs, provenance, appareils, pages |
| `/conversions` | Conversions et demandes |
| `/seo` | Search Console |
| `/performance` | PageSpeed + disponibilité |
| `/rapport` | Résumé du mois + impression PDF |
| `/login` | Magic link Supabase |
| `/admin` | Réservé `ADMIN_EMAILS` |

Clic sur l’**avatar** → panneau profil (URL, SSL, domaine, services connectés, changement de site).

Données : [`lib/queries/`](lib/queries/) (`getOverview`, `getTraffic`, … via `getDashboard` + `getProfile`).

## 5. API & crons

- `POST /api/collect` — événements depuis les sites clients (CORS domaine enregistré).
- `GET /api/cron/daily` — PageSpeed + GSC + health (1×/jour, [`vercel.json`](vercel.json)).
- Crons unitaires : `/api/cron/pagespeed`, `/api/cron/gsc`, `/api/cron/health` (même `CRON_SECRET`).
- Admin : `POST /api/admin/sync` — actualisation immédiate d’un site.

Sur Vercel, définir `CRON_SECRET` ; Vercel envoie `Authorization: Bearer <CRON_SECRET>`.

## 6. Maquettes & UI

**Référence unique** : [`akno-copilot-copy/`](akno-copilot-copy/) (6 pages HTML + `assets/copilot.css`, `assets/copilot.js`, polices).  
Styles fusionnés dans [`app/globals.css`](app/globals.css). Comportements maquette (segments 7 j / 30 j / 12 m, toggles, cartes cliquables, animations `rv` / `data-w` / anneaux) portés dans [`components/copilot/`](components/copilot/).

Période dashboard : query `?period=7d|30d|12m` (hero sous-pages + graphiques). Données : [`lib/queries/getDashboard.ts`](lib/queries/getDashboard.ts) + RPC Supabase `copilot_*`.

## 7. Déploiement Vercel

1. Importer le repo, framework Next.js.
2. Renseigner toutes les variables d’environnement.
3. Activer **PageSpeed Insights API** + **Search Console API** sur Google Cloud ; partager la propriété GSC avec l’email du compte de service.
4. Déployer ; vérifier le cron quotidien dans **Settings → Cron Jobs**.

---

Support : [akno.fr](https://akno.fr)
