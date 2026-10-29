/**
 * Database Seed — Production Content
 *
 * Static pages and sections (home, services, about, contact, legal, privacy,
 * gallery index, testimonials index, CTAs) come from seed-content.ts.
 *
 * Exhibits and testimonials are upserted from the resume-master portfolio
 * projection when RESUME_API_KEY (or RESUME_API_KEY_PORTFOLIO) is set.
 * Without a key, the shell still seeds and a message explains how to sync.
 *
 * Run with: npx prisma db seed
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { getResume } from "@fastdogcoding/resume-master";
import { syncResume } from "../src/lib/sync-resume";
import { seedStaticSite } from "./seed-content";

const connectionString =
  process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function resumeApiKey(): string | undefined {
  const key = process.env.RESUME_API_KEY || process.env.RESUME_API_KEY_PORTFOLIO;
  if (typeof key !== "string") return undefined;
  const trimmed = key.trim();
  return trimmed === "" ? undefined : trimmed;
}

async function main() {
  console.log("🌱 Seeding database...");

  // ── Clear existing data (idempotent re-seed) ──
  await prisma.pageSection.deleteMany();
  await prisma.section.deleteMany();
  await prisma.page.deleteMany();

  await seedStaticSite(prisma);

  const apiKey = resumeApiKey();
  if (apiKey) {
    console.log("↻ Syncing exhibits and testimonials from resume-master...");
    const projection = await getResume(apiKey);
    const result = await syncResume(prisma, projection);
    console.log(
      `   ↳ synced ${result.exhibits.length} exhibits and ${result.testimonials.length} testimonials`
    );
  } else {
    console.log(
      "RESUME_API_KEY is not set (RESUME_API_KEY_PORTFOLIO is also unset). " +
        "Skipped resume-master sync — exhibits and testimonials were not seeded. " +
        "Set a portfolio API key and re-run prisma db seed, or run npm run sync:db."
    );
  }

  const pageCount = await prisma.page.count();
  const sectionCount = await prisma.section.count();
  const placementCount = await prisma.pageSection.count();
  console.log(
    `✅ Seeded ${pageCount} pages, ${sectionCount} sections, ${placementCount} placements.`
  );

  const ctaDefault = await prisma.section.findUnique({
    where: { slug: "cta-default" },
  });
  if (ctaDefault) {
    const ctaPlacements = await prisma.pageSection.count({
      where: { sectionId: ctaDefault.id },
    });
    console.log(
      `   ↳ cta-default reused on ${ctaPlacements} pages (zero duplication)`
    );
  }

  const testimonialAndrew = await prisma.section.findUnique({
    where: { slug: "testimonial-andrew" },
  });
  if (testimonialAndrew) {
    const testimonialAndrewPlacements = await prisma.pageSection.count({
      where: { sectionId: testimonialAndrew.id },
    });
    console.log(
      `   ↳ testimonial-andrew reused on ${testimonialAndrewPlacements} pages`
    );
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (error) => {
    console.error("❌ Seed failed:", error);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
