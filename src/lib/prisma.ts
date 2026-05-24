/**
 * Prisma Client Singleton — Prisma 7+
 *
 * Prisma 7 requires driver adapters for database connections.
 * Uses @prisma/adapter-pg with the 'pg' pool.
 *
 * In development: attaches to globalThis to survive Next.js hot reloads.
 * In production: creates a single instance per cold start.
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL environment variable is not set. " +
        "Check your .env file or environment configuration."
    );
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
