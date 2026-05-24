/**
 * SectionRenderer — The "browser engine"
 *
 * Maps section.type → React component from the vocabulary.
 * Passes `displayHint` from the page_sections join table to enable
 * context-dependent rendering (e.g., testimonial compact vs. full).
 *
 * Silently skips unknown types (browser-like) but logs a warning
 * for developer awareness.
 *
 * Source: TDS § 1 — Architecture Note
 */

import type { ComponentType } from "react";
import type { SectionRecord } from "@/types";
import { HeroSection } from "@/_components/sections/HeroSection";
import { ProseSection } from "@/_components/sections/ProseSection";
import { GalleryGrid } from "@/_components/sections/GalleryGrid";
import { ExhibitSection } from "@/_components/sections/ExhibitSection";
import { CTASection } from "@/_components/sections/CTASection";
import { TestimonialSection } from "@/_components/sections/TestimonialSection";
import { StatBar } from "@/_components/sections/StatBar";

/**
 * The section vocabulary: maps type strings to their React components.
 * To add a new section type:
 *   1. Create the component in _components/sections/
 *   2. Add one entry here
 *   3. Insert DB rows with the new type
 */
const SECTION_MAP: Record<
  string,
  ComponentType<{ data: Record<string, unknown>; displayHint?: string | null }>
> = {
  hero: HeroSection,
  prose: ProseSection,
  gallery_grid: GalleryGrid,
  exhibit: ExhibitSection,
  cta: CTASection,
  testimonial: TestimonialSection,
  stat_bar: StatBar,
};

interface SectionRendererProps {
  sections: SectionRecord[];
}

export function SectionRenderer({ sections }: SectionRendererProps) {
  const safeSections = sections || [];
  const renderedElements: React.ReactNode[] = [];

  let i = 0;
  while (i < safeSections.length) {
    const section = safeSections[i];

    // Grouping logic: Detect consecutive full-mode testimonials and wrap them in a grid
    if (section.type === "testimonial" && section.displayHint !== "compact") {
      const group: SectionRecord[] = [];
      while (
        i < safeSections.length &&
        safeSections[i].type === "testimonial" &&
        safeSections[i].displayHint !== "compact"
      ) {
        group.push(safeSections[i]);
        i++;
      }

      renderedElements.push(
        <section
          key={`testimonial-group-${group[0].id}`}
          className="w-full py-16 md:py-24 bg-surface border-y border-border"
        >
          <div className="container mx-auto max-w-7xl px-4">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {group.map((s) => (
                <TestimonialSection
                  key={s.id}
                  data={s.data}
                  displayHint={s.displayHint}
                />
              ))}
            </div>
          </div>
        </section>
      );
      continue;
    }

    // Standard rendering
    const Component = SECTION_MAP[section.type];

    if (!Component) {
      // Log for developer awareness, but don't break the page for users
      console.warn(
        `[SectionRenderer] Unknown section type: "${section.type}" (id: ${section.id}). ` +
          `Add a mapping to SECTION_MAP to render this type.`
      );
      i++;
      continue;
    }

    renderedElements.push(
      <Component
        key={section.id}
        data={section.data}
        displayHint={section.displayHint}
      />
    );
    i++;
  }

  return <>{renderedElements}</>;
}
