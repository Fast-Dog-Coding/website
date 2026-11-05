import type { MetadataRoute } from "next";

/**
 * Pages the public site will serve.
 *
 * Gallery grids, page routes, and this sitemap all key off `isPublished`.
 * Resume sync retires a stale exhibit by setting that flag to false and
 * leaving the row in place, so the URL drops out of the sitemap and 404s.
 */
export const publishedPageWhere = { isPublished: true } as const;

export interface SitemapSourcePage {
  slug: string;
  parentSlug: string | null;
  updatedAt: Date;
  isPublished: boolean;
}

/**
 * Sitemap entries for published pages only.
 * Home is the site origin. A gallery exhibit is `/{parentSlug}/{slug}`
 * (the same path GalleryGrid links to).
 */
export function publishedSitemapEntries(
  pages: readonly SitemapSourcePage[],
  baseUrl: string
): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const page of pages) {
    if (page.isPublished !== true) continue;

    const path = page.parentSlug
      ? `/${page.parentSlug}/${page.slug}`
      : `/${page.slug}`;
    const routeUrl = page.slug === "home" && !page.parentSlug ? "" : path;

    entries.push({
      url: `${baseUrl}${routeUrl}`,
      lastModified: page.updatedAt,
      changeFrequency: "weekly",
      priority: page.slug === "home" ? 1 : 0.8,
    });
  }

  return entries;
}
