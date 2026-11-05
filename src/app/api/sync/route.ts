/**
 * Resume sync webhook.
 *
 * Authorization matches POST /api/revalidate (Bearer REVALIDATION_SECRET).
 * Fetches the portfolio projection from resume-master, upserts exhibits and
 * testimonials in Neon, unpublishes catalog gallery pages that left the
 * projection, then purges the ISR cache.
 *
 *   POST /api/sync
 *   Authorization: Bearer <REVALIDATION_SECRET>
 *
 *   POST /api/sync?dryRun=true
 *   Authorization: Bearer <REVALIDATION_SECRET>
 *
 * dryRun=true (or dryRun=1) reports exhibits, testimonials, and gallery
 * pages that would be unpublished, and does not write or revalidate.
 */

import { revalidatePath } from "next/cache";
import { NextRequest } from "next/server";
import { getResume } from "@fastdogcoding/resume-master";
import { authorizeRevalidation } from "@/lib/revalidation-auth";
import { prisma } from "@/lib/prisma";
import { syncResume } from "@/lib/sync-resume";

function resumeApiKey(): string | undefined {
  const key = process.env.RESUME_API_KEY || process.env.RESUME_API_KEY_PORTFOLIO;
  if (typeof key !== "string") return undefined;
  const trimmed = key.trim();
  return trimmed === "" ? undefined : trimmed;
}

function readDryRun(request: NextRequest): boolean {
  const value = request.nextUrl.searchParams.get("dryRun");
  if (value === null) return false;
  const normalized = value.trim().toLowerCase();
  return normalized === "1" || normalized === "true";
}

function redact(message: string, secrets: Array<string | undefined>): string {
  let redacted = message;
  for (const secret of secrets) {
    if (secret) redacted = redacted.split(secret).join("[redacted]");
  }
  return redacted;
}

export async function POST(request: NextRequest) {
  const denied = authorizeRevalidation(request);
  if (denied) return denied;

  const apiKey = resumeApiKey();
  if (!apiKey) {
    console.error("RESUME_API_KEY is not configured");
    return Response.json(
      { error: "Resume sync is not configured" },
      { status: 500 }
    );
  }

  try {
    const projection = await getResume(apiKey);
    const dryRun = readDryRun(request);
    const result = await syncResume(prisma, projection, { dryRun });
    if (!dryRun) {
      revalidatePath("/", "layout");
      revalidatePath("/sitemap.xml");
    }
    return Response.json({
      synced: !dryRun,
      dryRun,
      exhibits: result.exhibits,
      testimonials: result.testimonials,
      retired: result.retired,
      revalidated: !dryRun,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Resume sync failed:", redact(message, [apiKey]));
    return Response.json(
      {
        error: "Resume sync failed",
        details: redact(message, [
          apiKey,
          process.env.REVALIDATION_SECRET,
          process.env.DATABASE_URL,
          process.env.DATABASE_URL_UNPOOLED,
        ]),
      },
      { status: 500 }
    );
  }
}
