#!/usr/bin/env zsh
# MCP launcher: read-only Postgres access for Cursor (postgres-fdc-website server).
set -euo pipefail

ROOT="${0:A:h:h}"
cd "$ROOT"

if [[ -f .env ]]; then
  set -a
  source .env
  set +a
fi

URL="${DATABASE_URL:-postgresql://localhost:5432/fdc_website}"
exec npx -y @modelcontextprotocol/server-postgres "$URL"
