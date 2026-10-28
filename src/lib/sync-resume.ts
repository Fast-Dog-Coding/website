/**
 * In-place Neon upsert of resume-master exhibits and testimonials.
 *
 * Static pages (home, services, about, contact, legal, privacy, gallery,
 * testimonials) and their hero / prose / cta sections are left alone.
 * This module never deletes rows.
 */

import type { Prisma, PrismaClient } from "@prisma/client";
import type { ProjectedResume } from "@fastdogcoding/resume-master";
import type { ExhibitData, TestimonialData } from "@/types";
import {
  mapExhibits,
  mapTestimonials,
  TESTIMONIAL_CATALOG,
  type ExhibitPresentation,
} from "@/lib/resume-adapter";

export interface SyncResumeResult {
  exhibits: string[];
  testimonials: string[];
}

/** Home layout: hero 0, gallery grid 1, featured quote 2, cta 3. */
const HOME_TESTIMONIAL_SLUG = "testimonial-andrew";
const HOME_TESTIMONIAL_SORT_ORDER = 2;

const CTA_SLUG = "cta-default";

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

export async function syncResume(
  prisma: PrismaClient,
  projection: ProjectedResume
): Promise<SyncResumeResult> {
  const home = await requirePage(prisma, "home");
  const testimonialsPage = await requirePage(prisma, "testimonials");
  await requirePage(prisma, "gallery");
  const cta = await requireSection(prisma, CTA_SLUG);

  const testimonials = mapTestimonials(projection);
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

  const exhibits = mapExhibits(projection);
  const exhibitSlugs: string[] = [];

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
    exhibitSlugs.push(exhibit.presentation.exhibitSlug);
  }

  return {
    exhibits: unique(exhibitSlugs),
    testimonials: unique(testimonials.map((entry) => entry.presentation.slug)),
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
      parentSlug: "gallery",
      title: presentation.pageTitle,
      metaDesc: presentation.metaDesc,
      isPublished: true,
      isNav: false,
      navLabel: null,
      sortOrder: presentation.sortOrder,
    },
    update: {
      parentSlug: "gallery",
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
