/**
 * Purge the site ISR cache.
 *
 *   npm run revalidate
 *   npm run revalidate -- https://fastdogcoding.com
 *
 * Origin: CLI argument, else REVALIDATE_SITE_URL, else NEXT_PUBLIC_SITE_URL,
 * else https://fastdogcoding.com.
 */

import "dotenv/config";
import { revalidateSite, resolveSiteUrl } from "../src/lib/revalidate-site";

function cliSiteUrl(): string | undefined {
  return process.argv.slice(2).find((arg) => arg.trim() !== "" && !arg.startsWith("-"));
}

async function main() {
  if (!process.env.REVALIDATION_SECRET) {
    console.error("REVALIDATION_SECRET is not set.");
    process.exit(1);
  }

  const siteUrl = resolveSiteUrl(cliSiteUrl());
  console.log(`POST ${siteUrl}/api/revalidate`);
  await revalidateSite(siteUrl);
  console.log("Revalidated.");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
