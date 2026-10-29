/**
 * Shared bearer check for POST /api/revalidate and POST /api/sync.
 * Timing-safe comparison, matching the original revalidate route.
 */

import { timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";

/** Returns an error response, or null when the bearer token matches. */
export function authorizeRevalidation(request: NextRequest): Response | null {
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

  return null;
}
