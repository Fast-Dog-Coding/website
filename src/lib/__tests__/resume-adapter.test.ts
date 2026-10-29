import { afterEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_RESUME_SERVICE_URL,
  getResume,
  type ProjectedResume,
} from "@fastdogcoding/resume-master";
import {
  EXHIBIT_CATALOG,
  TESTIMONIAL_CATALOG,
  mapExhibits,
  mapTestimonials,
  normalizeReferenceTitle,
  projectToExhibitData,
  referenceToTestimonialData,
} from "@/lib/resume-adapter";
import { resolveSiteUrl } from "@/lib/revalidate-site";

const SECRET_KEY = "portfolio-key-do-not-leak";

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.RESUME_SERVICE_URL;
  delete process.env.REVALIDATE_SITE_URL;
  delete process.env.NEXT_PUBLIC_SITE_URL;
});

type ResumeFetch = (
  url: string,
  init?: RequestInit
) => Promise<{ ok: boolean; status: number; text: () => Promise<string> }>;

function mockFetch(response: { ok: boolean; status: number; body: string }) {
  const fetchMock = vi.fn<ResumeFetch>(async () => ({
    ok: response.ok,
    status: response.status,
    text: async () => response.body,
  }));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function fetchCall(
  fetchMock: ReturnType<typeof mockFetch>,
  index: number
): { url: string; init: RequestInit } {
  const invocation = fetchMock.mock.calls[index];
  if (!invocation) throw new Error(`missing fetch call ${index}`);
  const init = invocation[1];
  if (!init) throw new Error(`missing fetch init ${index}`);
  return { url: invocation[0], init };
}

describe("getResume", () => {
  it("posts to the default resume-master origin", async () => {
    const fetchMock = mockFetch({
      ok: true,
      status: 200,
      body: JSON.stringify({ projects: [], references: [], work: [] }),
    });

    const result = await getResume(SECRET_KEY);

    expect(DEFAULT_RESUME_SERVICE_URL).toBe("https://resume-master-nu.vercel.app");
    expect(fetchMock).toHaveBeenCalledOnce();
    const { url, init } = fetchCall(fetchMock, 0);
    expect(url).toBe("https://resume-master-nu.vercel.app/v1/resume");
    expect(init.method).toBe("POST");
    expect(init.headers).toMatchObject({
      Authorization: `Bearer ${SECRET_KEY}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    });
    expect(init.body).toBe("{}");
    expect(result).toEqual({ projects: [], references: [], work: [] });
  });

  it("prefers a non-empty baseUrl, then RESUME_SERVICE_URL, and strips trailing slashes", async () => {
    process.env.RESUME_SERVICE_URL = "https://env.example/";
    const fetchMock = mockFetch({
      ok: true,
      status: 200,
      body: JSON.stringify({ projects: [] }),
    });

    await getResume(SECRET_KEY, undefined, "https://override.example///");
    expect(fetchCall(fetchMock, 0).url).toBe("https://override.example/v1/resume");

    await getResume(SECRET_KEY, undefined, "   ");
    expect(fetchCall(fetchMock, 1).url).toBe("https://env.example/v1/resume");

    delete process.env.RESUME_SERVICE_URL;
    await getResume(SECRET_KEY, undefined, "");
    expect(fetchCall(fetchMock, 2).url).toBe(
      "https://resume-master-nu.vercel.app/v1/resume"
    );
  });

  it("sends only defined projection options", async () => {
    const fetchMock = mockFetch({
      ok: true,
      status: 200,
      body: JSON.stringify({ projects: [] }),
    });

    await getResume(SECRET_KEY, {
      projectIds: ["edvisor"],
      keywords: undefined,
      mode: "full",
      cutOffDate: "2020-01-01",
    });

    expect(JSON.parse(String(fetchCall(fetchMock, 0).init.body))).toEqual({
      projectIds: ["edvisor"],
      mode: "full",
      cutOffDate: "2020-01-01",
    });
  });

  it("rejects an empty API key before calling the network", async () => {
    const fetchMock = mockFetch({
      ok: true,
      status: 200,
      body: "{}",
    });

    await expect(getResume("   ")).rejects.toThrow(/non-empty string/);
    await expect(getResume(undefined as unknown as string)).rejects.toThrow(
      /non-empty string/
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("describes non-2xx responses without leaking the API key", async () => {
    mockFetch({
      ok: false,
      status: 401,
      body: `unauthorized ${SECRET_KEY}`,
    });

    await expect(getResume(SECRET_KEY)).rejects.toThrow(/HTTP 401/);
    await expect(getResume(SECRET_KEY)).rejects.toThrow(/\[redacted\]/);
    try {
      await getResume(SECRET_KEY);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).not.toContain(SECRET_KEY);
    }
  });

  it("describes invalid JSON without leaking the API key", async () => {
    mockFetch({
      ok: true,
      status: 200,
      body: `not-json ${SECRET_KEY}`,
    });

    try {
      await getResume(SECRET_KEY);
      expect.fail("expected invalid JSON to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      const message = (error as Error).message;
      expect(message).toMatch(/invalid JSON/);
      expect(message).not.toContain(SECRET_KEY);
    }
  });
});

describe("exhibit catalog", () => {
  it("lists all 14 projects in featured order", () => {
    expect(EXHIBIT_CATALOG.map((entry) => [entry.sortOrder, entry.projectId])).toEqual([
      [1, "portfolio-website"],
      [2, "candidate-vantage"],
      [3, "candidate-concierge"],
      [4, "resume-master"],
      [5, "candidate-brief"],
      [6, "homesalesone"],
      [7, "edvisor"],
      [8, "cms-storefront-lita"],
      [9, "resume-app"],
      [10, "digital-learning-guide"],
      [11, "compliance-attender"],
      [12, "phoenix"],
      [13, "exposure-monitoring"],
      [14, "buzzzone"],
    ]);
  });

  it("keeps the original page slugs and preserved titles", () => {
    const lita = EXHIBIT_CATALOG.find((entry) => entry.projectId === "cms-storefront-lita");
    const dlg = EXHIBIT_CATALOG.find((entry) => entry.projectId === "digital-learning-guide");
    const portfolio = EXHIBIT_CATALOG.find((entry) => entry.projectId === "portfolio-website");

    expect(lita).toMatchObject({
      pageSlug: "lita",
      exhibitSlug: "exhibit-lita",
      pageTitle: "CMS and Storefront — Lydz in the Attic",
    });
    expect(dlg).toMatchObject({
      pageSlug: "digital-learning-guide",
      exhibitSlug: "exhibit-dlg",
      testimonialSlug: "testimonial-jenn",
    });
    expect(portfolio?.pageTitle).toBe(
      "Fast Dog Coding Portfolio Website — Server-Driven UI Showcase"
    );
    expect(portfolio?.metaDesc).toMatch(/Server-driven portfolio site/);
  });
});

describe("project and reference mapping", () => {
  const projection: ProjectedResume = {
    work: [
      { id: "ks2-technologies", name: "Example Systems, Inc." },
      { id: "redspace", name: "Northwind Studio" },
    ],
    projects: [
      {
        id: "edvisor",
        name: "Edvisor",
        entity: "Fictional Studio",
        roles: ["Modernization Lead", "Mentor"],
        description: "A fictional lede.",
        challenge: "A fictional challenge.",
        approach: "A fictional approach.",
        impact: "A fictional impact.",
        keywords: ["Node.js", "MongoDB"],
      },
      {
        id: "not-on-the-site",
        name: "Unlisted",
        roles: ["Ignore Me"],
      },
      {
        id: "portfolio-website",
        name: "Portfolio Website",
        roles: ["AI Architect"],
        keywords: ["Next.js"],
      },
    ],
    references: [
      {
        name: "Jason Lickliter",
        title:
          "Full-Stack Developer / Solutions Consultant @ Somewhere Else, LLC | Advisor",
        reference: "A fictional recommendation about ownership.",
        snippets: ["Fictional snippet."],
        workId: "ks2-technologies",
      },
      {
        name: "Pat Example",
        title: "Staff Engineer @ Fictional Co | Community",
        reference: "Not shown on the site.",
      },
    ],
  };

  it("joins roles with ' / ' and maps exhibits by project.id", () => {
    const edvisor = projection.projects?.[0];
    expect(edvisor).toBeDefined();
    expect(projectToExhibitData(edvisor!).role).toBe("Modernization Lead / Mentor");
    expect(projectToExhibitData({ id: "x", name: "X" }).role).toBe("");

    const mapped = mapExhibits(projection);
    expect(mapped.map((entry) => entry.presentation.projectId)).toEqual([
      "portfolio-website",
      "edvisor",
    ]);
    expect(mapped[1]).toMatchObject({
      presentation: {
        exhibitSlug: "exhibit-edvisor",
        pageSlug: "edvisor",
        testimonialSlug: "testimonial-andrew",
      },
      data: {
        title: "Edvisor",
        client: "Fictional Studio",
        role: "Modernization Lead / Mentor",
        lede: "A fictional lede.",
        challenge: "A fictional challenge.",
        approach: "A fictional approach.",
        impact: "A fictional impact.",
        tech_stack: ["Node.js", "MongoDB"],
      },
    });
    expect(mapped[1].data.tech_stack).not.toBe(projection.projects?.[0].keywords);
    expect("exhibitSlug" in (projection.projects?.[0] as object)).toBe(false);
  });

  it("resolves testimonial company from workId and keeps catalog roles", () => {
    const jason = projection.references?.[0];
    expect(jason).toBeDefined();
    const data = referenceToTestimonialData(jason!, projection.work);
    expect(data).toEqual({
      name: "Jason Lickliter",
      role: "Full-Stack Developer / Solutions Consultant",
      company: "Example Systems, Inc.",
      content: "A fictional recommendation about ownership.",
      snippets: ["Fictional snippet."],
    });
    expect(data.snippets).not.toBe(jason!.snippets);

    const mapped = mapTestimonials(projection);
    expect(mapped.map((entry) => entry.presentation.slug)).toEqual(["testimonial-jason"]);
  });

  it("falls back to a cleaned @ company when workId is absent", () => {
    const data = referenceToTestimonialData(
      {
        name: "Pat Example",
        title: "Staff Engineer @ Fictional Co | Community",
        reference: "Hello.",
      },
      projection.work
    );
    expect(data.role).toBe("Staff Engineer");
    expect(data.company).toBe("Fictional Co");
  });

  it("falls back when workId does not match a work entry", () => {
    const data = referenceToTestimonialData(
      {
        name: "Pat Example",
        title: "Director of Nothing @ Missing Org",
        reference: "Hello.",
        workId: "missing-co",
      },
      [{ id: "redspace", name: "Northwind Studio" }]
    );
    expect(data.company).toBe("Missing Org");
    expect(data.role).toBe("Director of Nothing");
  });

  it("normalizes LinkedIn headline suffixes", () => {
    expect(
      normalizeReferenceTitle(
        "Senior Full-Stack Software Developer @ REDspace, Inc. | Mentor"
      )
    ).toEqual({
      role: "Senior Full-Stack Software Developer",
      company: "REDspace, Inc.",
    });
    expect(normalizeReferenceTitle("Lead Software Architect | Platform")).toEqual({
      role: "Lead Software Architect",
      company: "",
    });
  });
});

describe("testimonial catalog", () => {
  it("orders the five website quotes", () => {
    expect(TESTIMONIAL_CATALOG.map((entry) => [entry.sortOrder, entry.slug, entry.role])).toEqual([
      [1, "testimonial-jason", "Full-Stack Developer / Solutions Consultant"],
      [2, "testimonial-luis", "Lead Software Architect"],
      [3, "testimonial-andrew", "Director of Client Engineering"],
      [4, "testimonial-caro", "Senior Full-Stack Software Developer"],
      [5, "testimonial-jenn", "Senior Executive"],
    ]);
  });
});

describe("resolveSiteUrl", () => {
  it("prefers a CLI override, then REVALIDATE_SITE_URL, then NEXT_PUBLIC_SITE_URL", () => {
    process.env.REVALIDATE_SITE_URL = "https://env.example/";
    process.env.NEXT_PUBLIC_SITE_URL = "https://public.example";
    expect(resolveSiteUrl("https://cli.example/")).toBe("https://cli.example");
    expect(resolveSiteUrl("  ")).toBe("https://env.example");
    delete process.env.REVALIDATE_SITE_URL;
    expect(resolveSiteUrl()).toBe("https://public.example");
    delete process.env.NEXT_PUBLIC_SITE_URL;
    expect(resolveSiteUrl()).toBe("https://fastdogcoding.com");
  });
});
