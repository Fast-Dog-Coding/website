import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SectionRenderer } from "./SectionRenderer";
import type { SectionRecord } from "@/types";

const baseSection = {
  slug: null,
  data: {},
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
};

function testimonial(
  id: string,
  displayHint: string | null = null
): SectionRecord {
  return {
    ...baseSection,
    id,
    type: "testimonial",
    sortOrder: 0,
    displayHint,
    data: {
      name: `Person ${id}`,
      role: "CTO",
      company: "Acme",
      content: `Quote from ${id}`,
      snippets: [],
    },
  };
}

describe("SectionRenderer", () => {
  it("renders known section types", () => {
    render(
      <SectionRenderer
        sections={[
          {
            ...baseSection,
            id: "hero-1",
            type: "hero",
            sortOrder: 0,
            displayHint: null,
            data: { heading: "Principal Architecture" },
          },
        ]}
      />
    );

    expect(
      screen.getByRole("heading", { name: "Principal Architecture" })
    ).toBeInTheDocument();
  });

  it("groups consecutive full-mode testimonials into one grid", () => {
    const { container } = render(
      <SectionRenderer
        sections={[testimonial("t-1"), testimonial("t-2"), testimonial("t-3")]}
      />
    );

    const groupWrappers = container.querySelectorAll("section.bg-surface");
    expect(groupWrappers).toHaveLength(1);
    expect(screen.getByText("Person t-1")).toBeInTheDocument();
    expect(screen.getByText("Person t-2")).toBeInTheDocument();
    expect(screen.getByText("Person t-3")).toBeInTheDocument();
  });

  it("does not group compact testimonials with full-mode blocks", () => {
    const { container } = render(
      <SectionRenderer
        sections={[
          testimonial("full-1"),
          testimonial("compact-1", "compact"),
          testimonial("full-2"),
        ]}
      />
    );

    const groupWrappers = container.querySelectorAll("section.bg-surface");
    expect(groupWrappers).toHaveLength(2);
    expect(screen.getByText("Person full-1")).toBeInTheDocument();
    expect(screen.getByText("Person full-2")).toBeInTheDocument();
    expect(screen.getByText("View all testimonials")).toBeInTheDocument();
  });

  it("skips unknown section types without crashing", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    render(
      <SectionRenderer
        sections={[
          {
            ...baseSection,
            id: "unknown-1",
            type: "future_widget",
            sortOrder: 0,
            displayHint: null,
            data: {},
          },
        ]}
      />
    );

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Unknown section type: "future_widget"')
    );
    warnSpy.mockRestore();
  });

  it("handles missing sections input", () => {
    const { container } = render(
      <SectionRenderer sections={undefined as unknown as SectionRecord[]} />
    );

    expect(container).toBeEmptyDOMElement();
  });
});
