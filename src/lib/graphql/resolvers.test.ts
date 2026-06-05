import { beforeEach, describe, expect, it, vi } from "vitest";
import { resolvers } from "./resolvers";

const mockFindFirst = vi.fn();
const mockFindMany = vi.fn();
const mockFindUnique = vi.fn();
const mockSectionFindMany = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    page: {
      findFirst: (...args: unknown[]) => mockFindFirst(...args),
      findMany: (...args: unknown[]) => mockFindMany(...args),
    },
    section: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      findMany: (...args: unknown[]) => mockSectionFindMany(...args),
    },
  },
}));

const createdAt = new Date("2026-01-15T12:00:00.000Z");
const updatedAt = new Date("2026-01-16T12:00:00.000Z");

function buildPageWithSections() {
  return {
    id: "page-1",
    slug: "home",
    parentSlug: null,
    title: "Home",
    metaDesc: null,
    isPublished: true,
    isNav: true,
    navLabel: "Home",
    sortOrder: 0,
    createdAt,
    updatedAt,
    pageSections: [
      {
        sortOrder: 1,
        displayHint: null,
        section: {
          id: "section-1",
          slug: "home-hero",
          type: "hero",
          data: { heading: "Hello" },
          createdAt,
          updatedAt,
        },
      },
      {
        sortOrder: 0,
        displayHint: "compact",
        section: {
          id: "section-2",
          slug: "home-cta",
          type: "cta",
          data: { label: "Contact" },
          createdAt,
          updatedAt,
        },
      },
    ],
  };
}

describe("resolvers.Query.page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when no page matches", async () => {
    mockFindFirst.mockResolvedValue(null);

    const result = await resolvers.Query.page(null, { slug: "missing" });

    expect(result).toBeNull();
  });

  it("flattens page_sections into ordered sections with join metadata", async () => {
    mockFindFirst.mockResolvedValue(buildPageWithSections());

    const result = await resolvers.Query.page(null, { slug: "home" });

    expect(result).toMatchObject({
      slug: "home",
      sections: [
        {
          id: "section-1",
          type: "hero",
          sortOrder: 1,
          displayHint: null,
        },
        {
          id: "section-2",
          type: "cta",
          sortOrder: 0,
          displayHint: "compact",
        },
      ],
    });
    expect(result).not.toHaveProperty("pageSections");
  });

  it("filters by parentSlug when provided", async () => {
    mockFindFirst.mockResolvedValue(null);

    await resolvers.Query.page(null, {
      slug: "child",
      parentSlug: "gallery",
    });

    expect(mockFindFirst).toHaveBeenCalledWith({
      where: { slug: "child", parentSlug: "gallery" },
      include: {
        pageSections: {
          orderBy: { sortOrder: "asc" },
          include: { section: true },
        },
      },
    });
  });
});

describe("resolvers.Query.pages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("applies parentSlug and isPublished filters", async () => {
    mockFindMany.mockResolvedValue([buildPageWithSections()]);

    await resolvers.Query.pages(null, {
      parentSlug: "gallery",
      isPublished: true,
    });

    expect(mockFindMany).toHaveBeenCalledWith({
      where: { parentSlug: "gallery", isPublished: true },
      orderBy: { sortOrder: "asc" },
      include: {
        pageSections: {
          orderBy: { sortOrder: "asc" },
          include: { section: true },
        },
      },
    });
  });
});

describe("resolvers.Query.navPages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns only nav-visible pages in sort order", async () => {
    mockFindMany.mockResolvedValue([
      { slug: "home", navLabel: "Home", sortOrder: 0 },
    ]);

    const result = await resolvers.Query.navPages();

    expect(mockFindMany).toHaveBeenCalledWith({
      where: { isNav: true },
      orderBy: { sortOrder: "asc" },
      select: {
        slug: true,
        navLabel: true,
        sortOrder: true,
      },
    });
    expect(result).toEqual([{ slug: "home", navLabel: "Home", sortOrder: 0 }]);
  });
});

describe("resolvers.Query.section", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches a section by slug", async () => {
    const section = { id: "section-1", slug: "footer-cta", type: "cta" };
    mockFindUnique.mockResolvedValue(section);

    const result = await resolvers.Query.section(null, { slug: "footer-cta" });

    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { slug: "footer-cta" },
    });
    expect(result).toEqual(section);
  });
});

describe("resolvers.DateTime", () => {
  it("serializes Date values to ISO strings", () => {
    const date = new Date("2026-06-05T08:00:00.000Z");

    expect(resolvers.DateTime.serialize(date)).toBe("2026-06-05T08:00:00.000Z");
  });
});
