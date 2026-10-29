import { describe, expect, it } from "vitest";
import type { PrismaClient } from "@prisma/client";
import type { ProjectedResume } from "@fastdogcoding/resume-master";
import { syncResume } from "@/lib/sync-resume";

interface Row {
  id: string;
  [key: string]: unknown;
}

function createFakePrisma() {
  const pages = new Map<string, Row>();
  const sections = new Map<string, Row>();
  const placements: Row[] = [];
  const deleted: string[] = [];

  function refuseDelete(label: string) {
    return () => {
      deleted.push(label);
      throw new Error(`sync must not delete ${label}`);
    };
  }

  pages.set("home", { id: "page-home", slug: "home", title: "Home" });
  pages.set("testimonials", {
    id: "page-testimonials",
    slug: "testimonials",
    title: "Testimonials",
  });
  pages.set("gallery", { id: "page-gallery", slug: "gallery", title: "Gallery" });
  pages.set("services", { id: "page-services", slug: "services", title: "Services" });
  sections.set("cta-default", {
    id: "section-cta",
    slug: "cta-default",
    type: "cta",
    data: { heading: "Let's Connect" },
  });
  sections.set("hero-home", {
    id: "section-hero",
    slug: "hero-home",
    type: "hero",
    data: { heading: "Keep me" },
  });

  const prisma = {
    page: {
      findUnique: async ({ where }: { where: { slug: string } }) =>
        pages.get(where.slug) ?? null,
      upsert: async ({
        where,
        create,
        update,
      }: {
        where: { slug: string };
        create: Row;
        update: Row;
      }) => {
        const existing = pages.get(where.slug);
        if (existing) {
          const next = { ...existing, ...update };
          pages.set(where.slug, next);
          return next;
        }
        const created = { ...create, id: `page-${where.slug}` };
        pages.set(where.slug, created);
        return created;
      },
      deleteMany: refuseDelete("pages"),
    },
    section: {
      findUnique: async ({ where }: { where: { slug: string } }) =>
        sections.get(where.slug) ?? null,
      upsert: async ({
        where,
        create,
        update,
      }: {
        where: { slug: string };
        create: Row;
        update: Row;
      }) => {
        const existing = sections.get(where.slug);
        if (existing) {
          const next = { ...existing, ...update, slug: where.slug };
          sections.set(where.slug, next);
          return next;
        }
        const created = { ...create, id: `section-${where.slug}` };
        sections.set(where.slug, created);
        return created;
      },
      deleteMany: refuseDelete("sections"),
    },
    pageSection: {
      upsert: async ({
        where,
        create,
        update,
      }: {
        where: { pageId_sectionId: { pageId: string; sectionId: string } };
        create: Row;
        update: Row;
      }) => {
        const { pageId, sectionId } = where.pageId_sectionId;
        const index = placements.findIndex(
          (row) => row.pageId === pageId && row.sectionId === sectionId
        );
        if (index >= 0) {
          placements[index] = { ...placements[index], ...update };
          return placements[index];
        }
        const created = { ...create, id: `ps-${placements.length}` };
        placements.push(created);
        return created;
      },
      deleteMany: refuseDelete("page sections"),
    },
  };

  return { prisma: prisma as unknown as PrismaClient, pages, sections, placements, deleted };
}

const projection: ProjectedResume = {
  work: [
    { id: "ks2-technologies", name: "Example Systems, Inc." },
    { id: "redspace", name: "Northwind Studio" },
  ],
  projects: [
    {
      id: "homesalesone",
      name: "HomeSalesOne",
      entity: "Example Systems, Inc.",
      roles: ["Principal Full-Stack Developer"],
      description: "Fictional lede.",
      keywords: ["Node.js"],
    },
    {
      id: "resume-master",
      name: "Resume Master",
      entity: "Example LLC",
      roles: ["Architect"],
      description: "Canonical projection service.",
      keywords: ["TypeScript"],
    },
    {
      id: "not-a-catalog-project",
      name: "Skip me",
    },
  ],
  references: [
    {
      name: "Jason Lickliter",
      reference: "Fictional quote.",
      snippets: ["Snippet."],
      workId: "ks2-technologies",
      title: "Full-Stack Developer / Solutions Consultant @ Old Name",
    },
    {
      name: "Andrew Hamilton",
      reference: "Another fictional quote.",
      snippets: [],
      workId: "redspace",
    },
  ],
};

describe("syncResume", () => {
  it("upserts mapped exhibits and testimonials without deleting static rows", async () => {
    const fake = createFakePrisma();
    const result = await syncResume(fake.prisma, projection);

    expect(result.exhibits).toEqual(["exhibit-resume-master", "exhibit-homesalesone"]);
    expect(result.testimonials).toEqual(["testimonial-jason", "testimonial-andrew"]);
    expect(fake.deleted).toEqual([]);
    expect(fake.sections.get("hero-home")?.data).toEqual({ heading: "Keep me" });
    expect(fake.pages.get("services")?.title).toBe("Services");
    expect(fake.pages.has("not-a-catalog-project")).toBe(false);

    expect(fake.sections.get("testimonial-jason")?.data).toMatchObject({
      company: "Example Systems, Inc.",
      role: "Full-Stack Developer / Solutions Consultant",
      content: "Fictional quote.",
    });

    const resumePage = fake.pages.get("resume-master");
    expect(resumePage).toMatchObject({
      parentSlug: "gallery",
      sortOrder: 4,
      isPublished: true,
      isNav: false,
      title: "Resume Master — Fast Dog Coding",
    });

    const homeQuote = fake.placements.find(
      (row) => row.pageId === "page-home" && row.sectionId === "section-testimonial-andrew"
    );
    expect(homeQuote).toMatchObject({ sortOrder: 2, displayHint: "compact" });

    const testimonialsPage = fake.placements
      .filter((row) => row.pageId === "page-testimonials")
      .map((row) => [row.sectionId, row.sortOrder, row.displayHint]);
    expect(testimonialsPage).toEqual([
      ["section-testimonial-jason", 1, null],
      ["section-testimonial-andrew", 3, null],
    ]);

    const homesalesPlacements = fake.placements.filter(
      (row) => row.pageId === "page-homesalesone"
    );
    expect(homesalesPlacements.map((row) => [row.sortOrder, row.displayHint])).toEqual([
      [0, null],
      [1, "compact"],
      [2, null],
    ]);

    const resumePlacements = fake.placements.filter(
      (row) => row.pageId === "page-resume-master"
    );
    expect(resumePlacements.map((row) => [row.sortOrder, row.sectionId])).toEqual([
      [0, "section-exhibit-resume-master"],
      [1, "section-cta"],
    ]);
  });

  it("is idempotent when run twice", async () => {
    const fake = createFakePrisma();
    await syncResume(fake.prisma, projection);
    const again = await syncResume(fake.prisma, projection);
    expect(again.exhibits).toHaveLength(2);
    expect(fake.pages.size).toBe(4 + 2);
    expect(
      fake.placements.filter((row) => row.pageId === "page-homesalesone")
    ).toHaveLength(3);
  });

  it("refuses to sync when the gallery anchor is missing", async () => {
    const fake = createFakePrisma();
    fake.pages.delete("gallery");
    await expect(syncResume(fake.prisma, projection)).rejects.toThrow(/gallery/);
    expect(fake.sections.has("exhibit-homesalesone")).toBe(false);
  });
});
