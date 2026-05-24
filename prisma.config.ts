/**
 * Prisma Configuration — Prisma 7+
 *
 * The datasource URL has moved from schema.prisma to this file.
 * See: https://pris.ly/d/config-datasource
 */

import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
  migrations: {
    seed: "npx tsx prisma/seed.ts",
  },
});
