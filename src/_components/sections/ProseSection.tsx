/**
 * ProseSection
 *
 * Renders a Markdown body field as styled HTML.
 * Uses react-markdown for safe Markdown → React conversion.
 * Source: TDS § 2 — section type 'prose'
 */

import ReactMarkdown from "react-markdown";

interface ProseData {
  markdown: string;
}

export function ProseSection({ data }: { data: Record<string, unknown> }) {
  const { markdown } = data as unknown as ProseData;

  if (!markdown) return null;

  return (
    <section className="w-full py-12 md:py-16">
      <div className="container mx-auto max-w-3xl px-4">
        <div className="prose-fdc">
          <ReactMarkdown>{markdown}</ReactMarkdown>
        </div>
      </div>
    </section>
  );
}
