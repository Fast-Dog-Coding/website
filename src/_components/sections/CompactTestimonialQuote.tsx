/**
 * CompactTestimonialQuote — Client Component
 *
 * Pull-quote for `displayHint: "compact"`. Picks a random snippet after mount
 * so static pages get a fresh quote on hard reload without impure render.
 * Quote, attribution, and CTA reveal together (fade-in) — never attribution alone.
 */

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface CompactTestimonialQuoteProps {
  snippets: string[];
  content: string;
  name: string;
  role: string;
  company?: string;
}

export function CompactTestimonialQuote({
  snippets,
  content,
  name,
  role,
  company,
}: CompactTestimonialQuoteProps) {
  const [snippet, setSnippet] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const pick =
      snippets.length > 0
        ? snippets[Math.floor(Math.random() * snippets.length)]
        : content;
    setSnippet(pick);
  }, [snippets, content]);

  useEffect(() => {
    if (snippet === null) return;

    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, [snippet]);

  return (
    <section className="w-full py-16 md:py-24" aria-busy={snippet === null}>
      <div
        className={`container mx-auto max-w-3xl px-4 text-center transition-opacity duration-500 ease-out ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      >
        {snippet !== null && (
          <>
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
          </>
        )}
      </div>
    </section>
  );
}
