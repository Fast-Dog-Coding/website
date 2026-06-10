/**
 * Prisma Configuration — Prisma 7+
 *
 * The datasource URL has moved from schema.prisma to this file.
 * See: https://pris.ly/d/config-datasource
 */

import "dotenv/config";
import { defineConfig } from "prisma/config";

/** Matches .env.example — prisma generate does not connect; real DB URLs are enforced elsewhere. */
const LOCAL_DATABASE_URL = "postgresql://localhost:5432/fdc_website";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL ?? LOCAL_DATABASE_URL,
  },
  migrations: {
    seed: "npx tsx prisma/seed.ts",
  },
});
