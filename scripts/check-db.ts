/**
 * Connectivity check for scripts/dev.sh when psql is not on PATH.
 *
 * Uses pgPoolConfig so Neon URLs (sslmode require/prefer/verify-ca and
 * channel_binding=require) match the app pool. A URL with no sslmode,
 * including postgresql://localhost:5432/fdc_website, is left unchanged.
 *
 * Exits 0 when SELECT 1 succeeds, 1 otherwise.
 */

import { Pool } from "pg";
import { pgPoolConfig } from "../src/lib/pg-config";

async function main(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set.");
  }

  const pool = new Pool(pgPoolConfig(connectionString));
  try {
    await pool.query("SELECT 1");
  } finally {
    await pool.end();
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
});
