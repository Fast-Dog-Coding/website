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

npx prisma db push

if [ -n "${SEED_DATABASE:-}" ]; then
  echo "SEED_DATABASE is set — running prisma db seed (one-time bootstrap)."
  npx prisma db seed
fi

npm run test:run

exec next build
