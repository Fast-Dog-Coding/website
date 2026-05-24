import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://fastdogcoding.com";

  // Fetch all published pages
  const pages = await prisma.page.findMany({
    where: { isPublished: true },
    select: { slug: true, parentSlug: true, updatedAt: true },
  });

  const routes: MetadataRoute.Sitemap = pages.map((page) => {
    // Construct full path
    const path = page.parentSlug ? `/${page.parentSlug}/${page.slug}` : `/${page.slug}`;
    
    // Home page is just '/'
    const routeUrl = page.slug === "home" && !page.parentSlug ? "" : path;

    return {
      url: `${baseUrl}${routeUrl}`,
      lastModified: page.updatedAt,
      changeFrequency: "weekly",
      priority: page.slug === "home" ? 1 : 0.8,
    };
  });

  return routes;
}
