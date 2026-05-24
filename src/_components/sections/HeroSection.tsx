/**
 * HeroSection
 *
 * Full-width hero with H1, subheading, and optional CTA.
 * Source: TDS § 3 wireframe (lines 391–408)
 */

import { Button } from "@/_components/ui/Button";

interface HeroData {
  heading: string;
  subheading?: string;
  cta_label?: string;
  cta_href?: string;
}

export function HeroSection({ data }: { data: Record<string, unknown> }) {
  const { heading, subheading, cta_label, cta_href } = data as unknown as HeroData;

  return (
    <section className="w-full py-24 md:py-32">
      <div className="container mx-auto max-w-4xl px-4 text-center">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tighter text-primary">
          {heading}
        </h1>
        {subheading && (
          <p className="mt-4 text-lg md:text-xl text-secondary">
            {subheading}
          </p>
        )}
        {cta_label && cta_href && (
          <div className="mt-8">
            <Button href={cta_href}>{cta_label}</Button>
          </div>
        )}
      </div>
    </section>
  );
}
