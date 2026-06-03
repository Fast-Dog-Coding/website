/**
 * TestimonialSection
 *
 * Standalone testimonial: full blockquote with name, role, and company.
 * Supports `displayHint: 'compact'` for pull-quote style rendering
 * (shows a single snippet instead of the full content).
 *
 * Replaces both the old TestimonialGrid (individual items) and PullQuote
 * with a single reusable component.
 */

import Link from "next/link";
import { Card } from "@/_components/ui/Card";
import type { TestimonialData } from "@/types";

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
    const snippet =
      snippets && snippets.length > 0
        ? snippets[Math.floor(Math.random() * snippets.length)]
        : content;

    return (
      <section className="w-full py-16 md:py-24">
        <div className="container mx-auto max-w-3xl px-4 text-center">
          {/* Decorative accent bar */}
          <div className="mx-auto mb-8 h-1 w-16 rounded-full bg-accent" />
          <blockquote className="text-2xl md:text-3xl font-light italic text-primary leading-relaxed">
            &ldquo;{snippet}&rdquo;
          </blockquote>
          <p className="mt-6 text-base text-secondary">
            — {name}, {role}
            {company && ` @ ${company}`}
          </p>
          <p className="mt-8">
            <Link
              href="/testimonials"
              className="text-sm font-medium text-accent underline-offset-4 transition-colors duration-150 hover:text-accent-hover hover:underline"
            >
              View all testimonials
            </Link>
          </p>
        </div>
      </section>
    );
  }

  // Full mode: card-style testimonial (used on testimonials page)
  return (
    <Card className="flex flex-col h-full justify-between gap-6">
      <blockquote className="text-lg font-light italic text-primary leading-relaxed">
        &ldquo;{content}&rdquo;
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
