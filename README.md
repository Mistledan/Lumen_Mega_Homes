# Lumen Mega Homes — Luxury Real Estate Platform

A premium Nigerian real-estate website with an Express backend and a PostgreSQL CMS. The public site is deliberately content-driven so the business owner can update the homepage, listings, estates and enquiries from `/admin` — a separate, login-protected admin portal that customers cannot reach.

## Run locally (zero setup)

1. `npm install`
2. `npm run dev`

That one command brings up everything:

- `db` — an embedded PostgreSQL server (project-local, no Docker/service needed). First run initialises a UTF-8 cluster under `.pgdata`, applies `server/prisma/migrations`, and seeds the database with the site content, properties, estates (including the imported Adron benchmark listings) and journal posts.
- `api` — Express API on `http://localhost:5000`.
- `web` — Next.js site on `http://localhost:3002`.

Open:

- Public site: `http://localhost:3002`
- Admin portal: `http://localhost:3002/admin` (redirects to `/admin/login` without a session)

Default admin credentials come from `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env` (auto-created from `.env.example`). Change them before any real deployment.

## Manual commands

```bash
npm run db:boot      # start embedded Postgres + migrate + seed (kept running)
npm run db:migrate   # prisma migrate dev (interactive, needs a running DB)
npm run db:seed      # re-seed fixtures (idempotent)
npm run dev:web      # Next.js only, port 3002
npm run dev:api      # Express with tsx from src/index.ts
npm run typecheck    # tsc --noEmit
npm run build
```

## Production notes

Use managed PostgreSQL, object storage/CDN for media, HTTPS, a strong random `PASSWORD_PEPPER`, a secret-managed admin password, backups, logging and a reverse proxy. The demo images are remote Unsplash URLs; production should replace them with your own licensed imagery and storage.