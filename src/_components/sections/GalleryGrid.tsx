/**
 * GalleryGrid
 *
 * Server Component that fetches child pages and renders a grid of project cards.
 * Extracts exhibit data from the well-typed `exhibit` section on each child page.
 * Source: TDS § 3 wireframe (lines 412–457)
 */

import { gqlFetch } from "@/lib/gql/fetch";
import { PAGES_QUERY } from "@/lib/gql/queries";
import { Card } from "@/_components/ui/Card";
import { Tag } from "@/_components/ui/Tag";
import type { PagesQueryResponse, ExhibitData } from "@/types";

interface GalleryData {
  parent_slug: string;
  featured_limit?: number;
}

export async function GalleryGrid({
  data,
}: {
  data: Record<string, unknown>;
  displayHint?: string | null;
}) {
  const { parent_slug, featured_limit } =
    data as unknown as GalleryData;

  const { pages } = await gqlFetch<PagesQueryResponse>(PAGES_QUERY, {
    parentSlug: parent_slug,
    isPublished: true,
  });

  const safePages = pages || [];
  const displayPages = featured_limit ? safePages.slice(0, featured_limit) : safePages;

  if (displayPages.length === 0) {
    return null;
  }

  return (
    <section className="w-full py-16 md:py-24 bg-surface border-y border-border">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {displayPages.map((page) => {
            // Extract data from the exhibit section
            const exhibitSection = page.sections?.find(
              (s) => s.type === "exhibit"
            );
            const exhibitData = (exhibitSection?.data ?? {}) as unknown as ExhibitData;

            return (
              <Card
                key={page.id}
                href={`/${parent_slug}/${page.slug}`}
              >
                <div className="flex flex-col gap-4">
                  <h3 className="text-2xl font-semibold text-primary">
                    {exhibitData.title || page.title}
                  </h3>
                  {exhibitData.lede && (
                    <p className="text-base text-secondary">
                      {exhibitData.lede}
                    </p>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
