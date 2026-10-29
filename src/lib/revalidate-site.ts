/**
 * Ask the deployed site to purge its static cache.
 * Standalone via `npm run revalidate`, and after `npm run sync:db`.
 */

function stripTrailingSlashes(value: string): string {
  return value.trim().replace(/\/+$/, "");
}

function firstNonEmpty(...values: Array<string | undefined>): string | undefined {
  for (const value of values) {
    if (typeof value === "string" && value.trim() !== "") return value.trim();
  }
  return undefined;
}

/**
 * CLI argument, then REVALIDATE_SITE_URL, then NEXT_PUBLIC_SITE_URL,
 * then the production origin.
 */
export function resolveSiteUrl(override?: string): string {
  const chosen = firstNonEmpty(
    override,
    process.env.REVALIDATE_SITE_URL,
    process.env.NEXT_PUBLIC_SITE_URL
  );
  return stripTrailingSlashes(chosen ?? "https://fastdogcoding.com");
}

function redact(message: string, secret: string | undefined): string {
  if (!secret) return message;
  return message.split(secret).join("[redacted]");
}

export async function revalidateSite(siteUrl?: string): Promise<void> {
  const secret = process.env.REVALIDATION_SECRET;
  if (!secret) {
    throw new Error("REVALIDATION_SECRET is not set.");
  }

  const origin = resolveSiteUrl(siteUrl);
  const url = `${origin}/api/revalidate`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
      },
      cache: "no-store",
    });
  } catch (error) {
    const reason = error instanceof Error ? error.message : "network error";
    throw new Error(`Revalidation request failed: ${redact(reason, secret)}`);
  }

  if (!response.ok) {
    const body = redact((await response.text()).trim().slice(0, 300), secret);
    throw new Error(
      body
        ? `Revalidation failed with HTTP ${response.status}: ${body}`
        : `Revalidation failed with HTTP ${response.status}.`
    );
  }
}
