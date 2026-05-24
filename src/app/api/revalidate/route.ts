/**
 * ISR Revalidation Endpoint
 *
 * Token-protected POST handler that triggers on-demand revalidation.
 * Called after any DB write (Phase 2 editor save hook, or manual trigger).
 *
 * Usage:
 *   POST /api/revalidate
 *   Authorization: Bearer <REVALIDATION_SECRET>
 */

import { revalidatePath } from "next/cache";
import { NextRequest } from "next/server";
import { timingSafeEqual } from "crypto";

export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATION_SECRET;
  if (!secret) {
    console.error("REVALIDATION_SECRET is not configured");
    return Response.json(
      { error: "Revalidation is not configured" },
      { status: 500 }
    );
  }

  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "") ?? "";

  // Timing-safe comparison to prevent token-length leakage
  const tokenBuffer = Buffer.from(token);
  const secretBuffer = Buffer.from(secret);
  const isValid =
    tokenBuffer.length === secretBuffer.length &&
    timingSafeEqual(tokenBuffer, secretBuffer);

  if (!isValid) {
    return Response.json(
      { error: "Invalid revalidation token" },
      { status: 401 }
    );
  }

  try {
    revalidatePath("/", "layout");
    return Response.json({
      revalidated: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json(
      { error: "Revalidation failed", details: String(error) },
      { status: 500 }
    );
  }
}
