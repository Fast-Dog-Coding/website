/**
 * TestimonialSection
 *
 * Standalone testimonial: full blockquote with name, role, and company.
 * Supports `displayHint: 'compact'` for pull-quote style rendering
 * (delegates to CompactTestimonialQuote for client-side snippet pick + fade-in).
 *
 * Replaces both the old TestimonialGrid (individual items) and PullQuote
 * with a single reusable component.
 */

import { Card } from "@/_components/ui/Card";
import { CompactTestimonialQuote } from "@/_components/sections/CompactTestimonialQuote";
import type { TestimonialData } from "@/types";

/** Split testimonial body into paragraphs (blank lines first, then single newlines). */
function splitTestimonialParagraphs(text: string): string[] {
  const normalized = text.replace(/\\n/g, "\n").trim();
  if (!normalized) return [];

  const byBlank = normalized
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (byBlank.length > 1) return byBlank;

  if (normalized.includes("\n")) {
    return normalized
      .split(/\n+/)
      .map((p) => p.trim())
      .filter(Boolean);
  }

  return [normalized];
}

export function TestimonialSection({
  data,
  displayHint,
}: {
  data: Record<string, unknown>;
  displayHint?: string | null;
}) {
  const { name, role, company, content, snippets } =
    data as unknown as TestimonialData;

  // Compact mode: pull-quote style (used on home page, exhibit pages)
  if (displayHint === "compact") {
    return (
      <CompactTestimonialQuote
        snippets={snippets ?? []}
        content={content}
        name={name}
        role={role}
        company={company}
      />
    );
  }

  // Full mode: card-style testimonial (used on testimonials page)
  const paragraphs = splitTestimonialParagraphs(content);

  return (
    <Card className="flex flex-col h-full justify-between gap-6">
      <blockquote className="space-y-4 text-lg font-light italic text-primary leading-relaxed">
        {paragraphs.map((paragraph, index) => (
          <p key={index}>
            {index === 0 && <>&ldquo;</>}
            {paragraph}
            {index === paragraphs.length - 1 && <>&rdquo;</>}
          </p>
        ))}
      </blockquote>
      <div>
        <p className="font-medium text-accent">{name}</p>
        <p className="text-sm text-secondary">
          {role}
          {company && ` @ ${company}`}
        </p>
      </div>
    </Card>
  );
}
