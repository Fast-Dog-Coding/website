/**
 * In-place Neon upsert of resume-master exhibits and testimonials.
 *
 * Static pages (home, services, about, contact, legal, privacy, gallery,
 * testimonials) and their hero / prose / cta sections are left alone.
 *
 * Retirement policy (soft-unpublish, no deletes):
 * - Sync owns a gallery child only when `parentSlug` is `gallery` and the
 *   slug is an `EXHIBIT_CATALOG` page slug. That catalog is the managed-by
 *   marker. Anything else — static marketing pages, seed-only sections, and
 *   gallery children that are not in the catalog — is never retired.
 * - The keep set is project ids present in this projection and in
 *   `EXHIBIT_CATALOG`. A managed gallery page whose project id is outside
 *   that set is unpublished (`isPublished = false`) when it is currently
 *   published.
 * - The page row, slug, title, meta description, exhibit section, and
 *   placements stay. The public route already 404s when `isPublished` is
 *   false, and the surviving slug is enough to add a redirect later.
 *   A later projection that includes the project republishes the page,
 *   because the gallery upsert sets `isPublished` back to true.
 * - Already-unpublished managed pages are left untouched, so a second run
 *   is a no-op for retirement.
 * - Testimonial sections are not retired. Sync upserts them, but they are
 *   shared with the static testimonials index and the home featured quote,
 *   and sections have no publish flag. Detaching those placements would
 *   edit static pages. A retired exhibit keeps its quote placement on the
 *   unpublished page. A reference that leaves the projection is simply not
 *   re-upserted; its section row is not deleted.
 * - `dryRun` reads the same set and returns it, and writes nothing.
 */

import type { Prisma, PrismaClient } from "@prisma/client";
import type { PortfolioResume } from "@fastdogcoding/resume-master";
import type { ExhibitData, TestimonialData } from "@/types";
import {
  EXHIBIT_CATALOG,
  mapExhibits,
  mapTestimonials,
  TESTIMONIAL_CATALOG,
  type ExhibitPresentation,
} from "@/lib/resume-adapter";

export interface RetiredGalleryExhibit {
  /** Page id, kept so the row can be found after the slug is reused in a redirect. */
  id: string;
  slug: string;
  title: string;
  projectId: string;
  exhibitSlug: string;
  /** Public path, preserved for a later redirect map. */
  path: string;
}

export interface SyncResumeResult {
  exhibits: string[];
  testimonials: string[];
  retired: RetiredGalleryExhibit[];
  dryRun: boolean;
}

export interface SyncResumeOptions {
  /**
   * Compute the upsert and retirement sets without writing.
   * Useful for the first run against Neon after a projection change.
   */
  dryRun?: boolean;
}

/** Home layout: hero 0, gallery grid 1, featured quote 2, cta 3. */
const HOME_TESTIMONIAL_SLUG = "testimonial-andrew";
const HOME_TESTIMONIAL_SORT_ORDER = 2;

const CTA_SLUG = "cta-default";
const GALLERY_PARENT_SLUG = "gallery";

/**
 * Marketing shells seeded by prisma/seed-content.ts. Never unpublish these,
 * even if a catalog slug ever collided with one.
 */
const STATIC_PAGE_SLUGS = new Set([
  "home",
  "gallery",
  "services",
  "about",
  "contact",
  "testimonials",
  "legal",
  "privacy",
]);

const exhibitByPageSlug = new Map(
  EXHIBIT_CATALOG.map((entry) => [entry.pageSlug, entry])
);

const exhibitByProjectId = new Map(
  EXHIBIT_CATALOG.map((entry) => [entry.projectId, entry])
);

function toJson(value: ExhibitData | TestimonialData): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

async function requirePage(
  prisma: PrismaClient,
  slug: string
): Promise<{ id: string }> {
  const page = await prisma.page.findUnique({ where: { slug } });
  if (!page) {
    throw new Error(
      `Cannot sync resume content: page "${slug}" is missing. Seed static pages before syncing.`
    );
  }
  return page;
}

async function requireSection(
  prisma: PrismaClient,
  slug: string
): Promise<{ id: string }> {
  const section = await prisma.section.findUnique({ where: { slug } });
  if (!section) {
    throw new Error(
      `Cannot sync resume content: section "${slug}" is missing. Seed static pages before syncing.`
    );
  }
  return section;
}

async function ensurePlacement(
  prisma: PrismaClient,
  pageId: string,
  sectionId: string,
  sortOrder: number,
  displayHint: string | null
): Promise<void> {
  await prisma.pageSection.upsert({
    where: { pageId_sectionId: { pageId, sectionId } },
    create: { pageId, sectionId, sortOrder, displayHint },
    update: { sortOrder, displayHint },
  });
}

async function upsertSection(
  prisma: PrismaClient,
  type: string,
  slug: string,
  data: ExhibitData | TestimonialData
): Promise<{ id: string }> {
  return prisma.section.upsert({
    where: { slug },
    create: { type, slug, data: toJson(data) },
    update: { type, data: toJson(data) },
  });
}

function activeCatalogProjectIds(projection: PortfolioResume): Set<string> {
  const ids = new Set<string>();
  for (const project of projection.projects ?? []) {
    if (!project?.id) continue;
    if (!exhibitByProjectId.has(project.id)) continue;
    ids.add(project.id);
  }
  return ids;
}

function logRetirement(
  action: "unpublished" | "would unpublish",
  entry: RetiredGalleryExhibit
): void {
  console.info(
    `[sync-resume] ${action} gallery exhibit id=${entry.id} slug=${entry.slug} title=${JSON.stringify(entry.title)} projectId=${entry.projectId} exhibitSlug=${entry.exhibitSlug} path=${entry.path}`
  );
}

/**
 * Unpublish catalog gallery pages whose project is absent from this projection.
 * Does not delete pages, sections, or placements.
 */
async function retireStaleGalleryExhibits(
  prisma: PrismaClient,
  projection: PortfolioResume,
  dryRun: boolean
): Promise<RetiredGalleryExhibit[]> {
  const activeIds = activeCatalogProjectIds(projection);
  const galleryPages = await prisma.page.findMany({
    where: { parentSlug: GALLERY_PARENT_SLUG },
    select: {
      id: true,
      slug: true,
      title: true,
      parentSlug: true,
      isPublished: true,
      isNav: true,
    },
  });

  const retired: RetiredGalleryExhibit[] = [];

  for (const page of galleryPages) {
    const presentation: ExhibitPresentation | undefined = exhibitByPageSlug.get(
      page.slug
    );
    if (!presentation) continue;

    if (STATIC_PAGE_SLUGS.has(page.slug) || page.isNav) {
      console.warn(
        `[sync-resume] refused to retire slug=${page.slug} (static marketing page or nav item)`
      );
      continue;
    }

    if (activeIds.has(presentation.projectId)) continue;
    if (page.isPublished !== true) continue;

    const entry: RetiredGalleryExhibit = {
      id: page.id,
      slug: page.slug,
      title: page.title,
      projectId: presentation.projectId,
      exhibitSlug: presentation.exhibitSlug,
      path: `/${GALLERY_PARENT_SLUG}/${page.slug}`,
    };

    if (!dryRun) {
      await prisma.page.update({
        where: { id: page.id },
        data: { isPublished: false },
      });
    }

    logRetirement(dryRun ? "would unpublish" : "unpublished", entry);
    retired.push(entry);
  }

  retired.sort((a, b) => a.slug.localeCompare(b.slug));
  return retired;
}

export async function syncResume(
  prisma: PrismaClient,
  projection: PortfolioResume,
  options: SyncResumeOptions = {}
): Promise<SyncResumeResult> {
  const dryRun = options.dryRun === true;

  const home = await requirePage(prisma, "home");
  const testimonialsPage = await requirePage(prisma, "testimonials");
  await requirePage(prisma, "gallery");
  const cta = await requireSection(prisma, CTA_SLUG);

  const testimonials = mapTestimonials(projection);
  const exhibits = mapExhibits(projection);

  if (!dryRun) {
    const testimonialIds = new Map<string, string>();

    for (const testimonial of testimonials) {
      const section = await upsertSection(
        prisma,
        "testimonial",
        testimonial.presentation.slug,
        testimonial.data
      );
      testimonialIds.set(testimonial.presentation.slug, section.id);
    }

    for (const presentation of TESTIMONIAL_CATALOG) {
      const sectionId =
        testimonialIds.get(presentation.slug) ??
        (
          await prisma.section.findUnique({
            where: { slug: presentation.slug },
          })
        )?.id;
      if (!sectionId) continue;
      await ensurePlacement(
        prisma,
        testimonialsPage.id,
        sectionId,
        presentation.sortOrder,
        null
      );
    }

    const andrewId =
      testimonialIds.get(HOME_TESTIMONIAL_SLUG) ??
      (
        await prisma.section.findUnique({
          where: { slug: HOME_TESTIMONIAL_SLUG },
        })
      )?.id;
    if (andrewId) {
      await ensurePlacement(
        prisma,
        home.id,
        andrewId,
        HOME_TESTIMONIAL_SORT_ORDER,
        "compact"
      );
    }

    for (const exhibit of exhibits) {
      const section = await upsertSection(
        prisma,
        "exhibit",
        exhibit.presentation.exhibitSlug,
        exhibit.data
      );
      const page = await upsertGalleryPage(prisma, exhibit.presentation);
      await ensurePlacement(prisma, page.id, section.id, 0, null);

      let nextOrder = 1;
      if (exhibit.presentation.testimonialSlug) {
        const quoteId = await resolveTestimonialId(
          prisma,
          exhibit.presentation.testimonialSlug,
          testimonialIds
        );
        if (quoteId) {
          await ensurePlacement(prisma, page.id, quoteId, nextOrder, "compact");
          nextOrder += 1;
        }
      }

      await ensurePlacement(prisma, page.id, cta.id, nextOrder, null);
    }
  }

  const retired = await retireStaleGalleryExhibits(prisma, projection, dryRun);

  return {
    exhibits: unique(exhibits.map((entry) => entry.presentation.exhibitSlug)),
    testimonials: unique(testimonials.map((entry) => entry.presentation.slug)),
    retired,
    dryRun,
  };
}

async function resolveTestimonialId(
  prisma: PrismaClient,
  slug: string,
  known: Map<string, string>
): Promise<string | undefined> {
  const cached = known.get(slug);
  if (cached) return cached;
  const existing = await prisma.section.findUnique({ where: { slug } });
  return existing?.id;
}

async function upsertGalleryPage(
  prisma: PrismaClient,
  presentation: ExhibitPresentation
): Promise<{ id: string }> {
  return prisma.page.upsert({
    where: { slug: presentation.pageSlug },
    create: {
      slug: presentation.pageSlug,
      parentSlug: GALLERY_PARENT_SLUG,
      title: presentation.pageTitle,
      metaDesc: presentation.metaDesc,
      isPublished: true,
      isNav: false,
      navLabel: null,
      sortOrder: presentation.sortOrder,
    },
    update: {
      parentSlug: GALLERY_PARENT_SLUG,
      title: presentation.pageTitle,
      metaDesc: presentation.metaDesc,
      isPublished: true,
      isNav: false,
      navLabel: null,
      sortOrder: presentation.sortOrder,
    },
  });
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}
