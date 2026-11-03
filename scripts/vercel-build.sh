#!/usr/bin/env sh
# Vercel production build: generate client, sync schema, optional seed, then Next.js.
set -eu

if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env
  set +a
fi

npx prisma generate

# Neon: schema changes need the direct (unpooled) connection on Vercel.
export DATABASE_URL="${DATABASE_URL_UNPOOLED:-${POSTGRES_URL_NON_POOLING:-${DATABASE_URL:-}}}"

if [ -z "${DATABASE_URL}" ]; then
  echo "DATABASE_URL is not set. Connect Neon in Vercel → Storage before deploying." >&2
  exit 1
fi

# Quaint (Prisma schema engine 7.8.0) only understands sslmode
# disable/prefer/require — verify-full is treated as prefer — and it accepts
# invalid certificates unless sslaccept=strict. pg is not used for db push.
# Keep sslmode=require and require a verified certificate. Scoped to this
# command: prisma db seed uses pgPoolConfig, which rewrites sslmode to
# verify-full for node-postgres and does not need sslaccept.
PRISMA_DB_PUSH_URL="$(npx tsx scripts/print-prisma-db-push-url.ts)"
DATABASE_URL="$PRISMA_DB_PUSH_URL" npx prisma db push

if [ -n "${SEED_DATABASE:-}" ]; then
  echo "SEED_DATABASE is set — running prisma db seed (one-time bootstrap)."
  npx prisma db seed
fi

npm run test:run

exec next build
