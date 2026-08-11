# infra — deploy Tesera to Railway

The Tesera ERP app (`@tesera/erp`, Next.js) is containerised for Railway using
[`infra/Dockerfile`](./Dockerfile), which produces a small standalone image.

## Files

- `infra/Dockerfile` — multi-stage build: `pnpm install` → `next build`
  (standalone) → minimal runtime that runs `node apps/erp/server.js`.
- `railway.json` (repo root) — tells Railway to build with `infra/Dockerfile`.
- `.dockerignore` (repo root) — keeps `node_modules` / `.next` out of the build
  context so the image installs cleanly for Linux.

## Deploy on Railway

1. Push is already set up: repo is `github.com/malikfattaev/Tesera`, branch `main`.
2. Railway → **New Project** → **Deploy from GitHub repo** → pick `malikfattaev/Tesera`.
3. Leave **Root Directory** empty. Railway reads `railway.json` and builds
   `infra/Dockerfile` automatically.
4. Networking → **Generate Domain**. Railway injects `PORT`; the server binds it.

No env vars are required yet. When the DB lands, add `DATABASE_URL` and swap the
in-memory adapter for the Postgres/Prisma one.

## Test the image locally

```bash
docker build -f infra/Dockerfile -t tesera-erp .
docker run --rm -p 4000:4000 tesera-erp
# open http://localhost:4000
```

## Notes

- Data is currently **in-memory**, so it resets on every deploy/restart and is
  not shared between instances. Fine for demos; run a single instance until the
  database is wired up.
- The auth actor is hardcoded to `admin` — do not treat this as access-controlled
  until real auth is added.
