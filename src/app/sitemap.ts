import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import {
  publishedPageWhere,
  publishedSitemapEntries,
} from "@/lib/sitemap-entries";

/**
 * Next caches sitemap handlers unless they opt into dynamic rendering.
 * Read published pages on each request so an exhibit unpublished by resume
 * sync leaves the sitemap without a rebuild. `revalidatePath("/sitemap.xml")`
 * still runs after sync for any copy a CDN already stored.
 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://fastdogcoding.com";

  const pages = await prisma.page.findMany({
    where: publishedPageWhere,
    select: {
      slug: true,
      parentSlug: true,
      updatedAt: true,
      isPublished: true,
    },
  });

  return publishedSitemapEntries(pages, baseUrl);
}
