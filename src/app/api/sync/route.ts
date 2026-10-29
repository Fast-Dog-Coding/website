/**
 * Resume sync webhook.
 *
 * Authorization matches POST /api/revalidate (Bearer REVALIDATION_SECRET).
 * Fetches the portfolio projection from resume-master, upserts exhibits and
 * testimonials in Neon, then purges the ISR cache.
 *
 *   POST /api/sync
 *   Authorization: Bearer <REVALIDATION_SECRET>
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
    const result = await syncResume(prisma, projection);
    revalidatePath("/", "layout");
    return Response.json({
      synced: true,
      exhibits: result.exhibits,
      testimonials: result.testimonials,
      revalidated: true,
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
