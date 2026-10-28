/**
 * Pull the portfolio projection from resume-master and upsert Neon in place.
 *
 *   npm run sync:db
 *   npm run sync:db -- --no-revalidate
 *
 * Revalidation runs afterward when REVALIDATION_SECRET is set, unless
 * --no-revalidate is passed.
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { getResume } from "@fastdogcoding/resume-master";
import { syncResume } from "../src/lib/sync-resume";
import { revalidateSite } from "../src/lib/revalidate-site";

function readApiKey(): string {
  const apiKey = process.env.RESUME_API_KEY || process.env.RESUME_API_KEY_PORTFOLIO;
  if (typeof apiKey !== "string" || apiKey.trim() === "") {
    throw new Error(
      "RESUME_API_KEY is not set. Set RESUME_API_KEY or RESUME_API_KEY_PORTFOLIO to the portfolio key issued by resume-master."
    );
  }
  return apiKey.trim();
}

async function main() {
  const skipRevalidate = process.argv.includes("--no-revalidate");
  const apiKey = readApiKey();
  const connectionString =
    process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL_UNPOOLED or DATABASE_URL must be set.");
  }

  const projection = await getResume(apiKey);
  const pool = new Pool({ connectionString });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  try {
    const result = await syncResume(prisma, projection);
    const exhibitSummary = result.exhibits.join(", ") || "(none)";
    const testimonialSummary = result.testimonials.join(", ") || "(none)";
    console.log(
      `Upserted ${result.exhibits.length} exhibit${result.exhibits.length === 1 ? "" : "s"}: ${exhibitSummary}`
    );
    console.log(
      `Upserted ${result.testimonials.length} testimonial${result.testimonials.length === 1 ? "" : "s"}: ${testimonialSummary}`
    );
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }

  if (skipRevalidate) {
    console.log("Skipping ISR revalidation (--no-revalidate).");
    return;
  }
  if (!process.env.REVALIDATION_SECRET) {
    console.log("REVALIDATION_SECRET is unset; skipping ISR revalidation.");
    return;
  }

  await revalidateSite();
  console.log("ISR cache revalidated.");
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
});
