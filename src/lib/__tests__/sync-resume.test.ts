import { describe, expect, it, vi } from "vitest";
import type { PrismaClient } from "@prisma/client";
import type { PortfolioResume } from "@fastdogcoding/resume-master";
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
  const updates: Array<{ id: string; isPublished?: boolean }> = [];

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
      findMany: async ({
        where,
      }: {
        where?: { parentSlug?: string };
      }) =>
        [...pages.values()].filter((page) => {
          if (
            where?.parentSlug !== undefined &&
            page.parentSlug !== where.parentSlug
          ) {
            return false;
          }
          return true;
        }),
      update: async ({
        where,
        data,
      }: {
        where: { id: string };
        data: { isPublished?: boolean };
      }) => {
        const existing = [...pages.values()].find((page) => page.id === where.id);
        if (!existing) {
          throw new Error(`missing page ${where.id}`);
        }
        const next = { ...existing, ...data };
        pages.set(String(existing.slug), next);
        updates.push({ id: where.id, isPublished: data.isPublished });
        return next;
      },
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

  return {
    prisma: prisma as unknown as PrismaClient,
    pages,
    sections,
    placements,
    deleted,
    updates,
  };
}

const projection: PortfolioResume = {
  basics: { name: "Grant Lindsay" },
  meta: { clientId: "portfolio", cutOffDate: null, projected: true },
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

  it("unpublishes a catalog gallery page missing from the projection and leaves static pages", async () => {
    const fake = createFakePrisma();
    fake.pages.set("phoenix", {
      id: "page-phoenix",
      slug: "phoenix",
      parentSlug: "gallery",
      title: "Phoenix — Investment Lifecycle Management",
      isPublished: true,
      isNav: false,
    });
    fake.pages.set("hand-built", {
      id: "page-hand-built",
      slug: "hand-built",
      parentSlug: "gallery",
      title: "Hand built exhibit",
      isPublished: true,
      isNav: false,
    });
    fake.pages.set("edvisor", {
      id: "page-edvisor",
      slug: "edvisor",
      parentSlug: "gallery",
      title: "Edvisor — LMS Modernization",
      isPublished: true,
      isNav: true,
    });
    fake.sections.set("exhibit-phoenix", {
      id: "section-exhibit-phoenix",
      slug: "exhibit-phoenix",
      type: "exhibit",
      data: { title: "Phoenix" },
    });
    fake.placements.push({
      id: "ps-phoenix",
      pageId: "page-phoenix",
      sectionId: "section-exhibit-phoenix",
      sortOrder: 0,
      displayHint: null,
    });

    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      const result = await syncResume(fake.prisma, projection);

      expect(result.dryRun).toBe(false);
      expect(result.retired).toEqual([
        {
          id: "page-phoenix",
          slug: "phoenix",
          title: "Phoenix — Investment Lifecycle Management",
          projectId: "phoenix",
          exhibitSlug: "exhibit-phoenix",
          path: "/gallery/phoenix",
        },
      ]);
      expect(info).toHaveBeenCalledWith(
        expect.stringContaining(
          'unpublished gallery exhibit id=page-phoenix slug=phoenix title="Phoenix — Investment Lifecycle Management" projectId=phoenix exhibitSlug=exhibit-phoenix path=/gallery/phoenix'
        )
      );

      expect(fake.pages.get("phoenix")).toMatchObject({
        isPublished: false,
        slug: "phoenix",
        parentSlug: "gallery",
        title: "Phoenix — Investment Lifecycle Management",
      });
      expect(fake.sections.get("exhibit-phoenix")?.data).toEqual({ title: "Phoenix" });
      expect(
        fake.placements.some((row) => row.pageId === "page-phoenix")
      ).toBe(true);
      expect(fake.pages.get("hand-built")).toMatchObject({
        isPublished: true,
        title: "Hand built exhibit",
      });
      expect(fake.pages.get("edvisor")?.isPublished).toBe(true);
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining("refused to retire slug=edvisor")
      );
      expect(fake.pages.get("services")?.title).toBe("Services");
      expect(fake.pages.get("gallery")?.title).toBe("Gallery");
      expect(fake.pages.get("home")?.slug).toBe("home");
      expect(fake.sections.get("hero-home")?.data).toEqual({ heading: "Keep me" });
      expect(fake.deleted).toEqual([]);
      expect(fake.updates).toEqual([{ id: "page-phoenix", isPublished: false }]);

      info.mockClear();
      const again = await syncResume(fake.prisma, projection);
      expect(again.retired).toEqual([]);
      expect(fake.pages.get("phoenix")?.isPublished).toBe(false);
      expect(fake.updates).toEqual([{ id: "page-phoenix", isPublished: false }]);
      expect(fake.deleted).toEqual([]);
      expect(info).not.toHaveBeenCalled();
    } finally {
      info.mockRestore();
      warn.mockRestore();
    }
  });

  it("dry run reports the retirement and does not write", async () => {
    const fake = createFakePrisma();
    fake.pages.set("phoenix", {
      id: "page-phoenix",
      slug: "phoenix",
      parentSlug: "gallery",
      title: "Phoenix — Investment Lifecycle Management",
      isPublished: true,
      isNav: false,
    });

    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    try {
      const result = await syncResume(fake.prisma, projection, { dryRun: true });

      expect(result.dryRun).toBe(true);
      expect(result.exhibits).toEqual([
        "exhibit-resume-master",
        "exhibit-homesalesone",
      ]);
      expect(result.retired.map((entry) => entry.slug)).toEqual(["phoenix"]);
      expect(fake.pages.get("phoenix")?.isPublished).toBe(true);
      expect(fake.pages.has("resume-master")).toBe(false);
      expect(fake.pages.has("homesalesone")).toBe(false);
      expect(fake.sections.has("exhibit-homesalesone")).toBe(false);
      expect(fake.updates).toEqual([]);
      expect(fake.deleted).toEqual([]);
      expect(fake.pages.get("services")?.title).toBe("Services");
      expect(info).toHaveBeenCalledWith(
        expect.stringContaining("would unpublish gallery exhibit id=page-phoenix")
      );
    } finally {
      info.mockRestore();
    }
  });

  it("republishes a retired catalog page when the project returns", async () => {
    const fake = createFakePrisma();
    fake.pages.set("phoenix", {
      id: "page-phoenix",
      slug: "phoenix",
      parentSlug: "gallery",
      title: "Phoenix — Investment Lifecycle Management",
      isPublished: true,
      isNav: false,
    });

    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    try {
      await syncResume(fake.prisma, projection);
      expect(fake.pages.get("phoenix")?.isPublished).toBe(false);

      const returned = await syncResume(fake.prisma, {
        ...projection,
        projects: [...projection.projects, { id: "phoenix", name: "Phoenix" }],
      });

      expect(returned.retired).toEqual([]);
      expect(returned.exhibits).toContain("exhibit-phoenix");
      expect(fake.pages.get("phoenix")).toMatchObject({
        isPublished: true,
        parentSlug: "gallery",
        title: "Phoenix — Investment Lifecycle Management",
      });
      expect(fake.deleted).toEqual([]);
    } finally {
      info.mockRestore();
    }
  });
});
