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
import { authorizeRevalidation } from "@/lib/revalidation-auth";

export async function POST(request: NextRequest) {
  const denied = authorizeRevalidation(request);
  if (denied) return denied;

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
