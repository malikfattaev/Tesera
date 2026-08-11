# syntax=docker/dockerfile:1
# Tesera ERP — production image for Railway (Next.js standalone output).
# Build context is the repo root (see railway.json -> dockerfilePath).

FROM node:20-alpine AS base
RUN corepack enable
WORKDIR /app

# ---- Build ----
FROM base AS builder
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @tesera/erp build

# ---- Run ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# Railway provides PORT at runtime; bind all interfaces.
ENV HOSTNAME=0.0.0.0
ENV PORT=4000

# Next.js standalone output is monorepo-aware (outputFileTracingRoot = repo root),
# so it already contains apps/erp/server.js plus the traced node_modules.
COPY --from=builder /app/apps/erp/.next/standalone ./
COPY --from=builder /app/apps/erp/.next/static ./apps/erp/.next/static
COPY --from=builder /app/apps/erp/public ./apps/erp/public

EXPOSE 4000
CMD ["node", "apps/erp/server.js"]
