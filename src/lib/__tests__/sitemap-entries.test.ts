import { describe, expect, it } from "vitest";
import { publishedSitemapEntries } from "@/lib/sitemap-entries";

const updatedAt = new Date("2026-05-01T00:00:00.000Z");

describe("publishedSitemapEntries", () => {
  it("lists published pages and omits retired gallery exhibits", () => {
    const entries = publishedSitemapEntries(
      [
        {
          slug: "home",
          parentSlug: null,
          updatedAt,
          isPublished: true,
        },
        {
          slug: "services",
          parentSlug: null,
          updatedAt,
          isPublished: true,
        },
        {
          slug: "gallery",
          parentSlug: null,
          updatedAt,
          isPublished: true,
        },
        {
          slug: "homesalesone",
          parentSlug: "gallery",
          updatedAt,
          isPublished: true,
        },
        {
          slug: "phoenix",
          parentSlug: "gallery",
          updatedAt,
          isPublished: false,
        },
        {
          slug: "about",
          parentSlug: null,
          updatedAt,
          isPublished: false,
        },
      ],
      "https://fastdogcoding.com"
    );

    expect(entries.map((entry) => entry.url)).toEqual([
      "https://fastdogcoding.com",
      "https://fastdogcoding.com/services",
      "https://fastdogcoding.com/gallery",
      "https://fastdogcoding.com/gallery/homesalesone",
    ]);
    expect(entries[0]).toMatchObject({ priority: 1, changeFrequency: "weekly" });
    expect(entries[3]).toMatchObject({
      priority: 0.8,
      lastModified: updatedAt,
    });
    expect(entries.some((entry) => entry.url.includes("phoenix"))).toBe(false);
  });
});
