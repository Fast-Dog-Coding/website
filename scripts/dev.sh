#!/usr/bin/env zsh
# Launch the Fast Dog Coding site in development mode.
# Usage: ./scripts/dev.sh   or   npm run launch

set -euo pipefail

ROOT="${0:A:h:h}"
cd "$ROOT"

info() { printf '\033[1;34m→\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33m!\033[0m %s\n' "$*" >&2; }
die()  { printf '\033[1;31m✗\033[0m %s\n' "$*" >&2; exit 1; }

# ── Environment ──────────────────────────────────────────────────────────────

if [[ ! -f .env ]]; then
  die ".env not found. Create one in the project root, for example:

    DATABASE_URL=postgresql://localhost:5432/fdc_website
    REVALIDATION_SECRET=dev-secret-change-me
    NEXT_PUBLIC_SITE_URL=http://localhost:3000

  Then: createdb fdc_website && npx prisma db push && npx prisma db seed"
fi

set -a
source .env
set +a

if [[ -z "${DATABASE_URL:-}" ]]; then
  die "DATABASE_URL is not set in .env"
fi

# ── Dependencies ─────────────────────────────────────────────────────────────

if [[ ! -d node_modules ]]; then
  info "Installing npm dependencies…"
  npm install
fi

info "Generating Prisma client…"
npx prisma generate

# ── Database (optional checks) ───────────────────────────────────────────────

check_database() {
  if command -v psql >/dev/null 2>&1; then
    psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -q -c "SELECT 1" >/dev/null 2>&1
    return $?
  fi

  # Fallback when psql is not on PATH
  node --input-type=module -e "
    import pg from 'pg';
    const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
    try {
      await pool.query('SELECT 1');
    } finally {
      await pool.end();
    }
  " 2>/dev/null
}

if ! check_database; then
  warn "Cannot connect to PostgreSQL (${DATABASE_URL%%@*}@…)."
  warn "Ensure Postgres is running, then: createdb fdc_website && npx prisma db push && npx prisma db seed"
  read -r "?Continue without a database? [y/N] " reply
  case "$reply" in
    [yY]|[yY][eE][sS]) ;;
    *) exit 1 ;;
  esac
else
  # Warn if schema looks empty (no pages table or no rows)
  if command -v psql >/dev/null 2>&1; then
    page_count="$(psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -q -t -A -c \
      "SELECT COUNT(*) FROM pages" 2>/dev/null || echo "")"
    if [[ "$page_count" == "0" ]]; then
      warn "Database is reachable but has no pages. Run: npx prisma db seed"
    fi
  fi
fi

# ── Dev server ───────────────────────────────────────────────────────────────

PORT="${PORT:-3000}"
info "Starting Next.js dev server at http://localhost:${PORT}"
exec npm run dev -- --port "$PORT"
