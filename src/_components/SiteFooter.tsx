/**
 * SiteFooter
 *
 * Footer with lightweight CTA links and legal nav.
 * Queries the canonical CTA section by slug for consistent data.
 * Source: TDS § 3 wireframe (lines 557–574)
 */

import { prisma } from "@/lib/prisma";

export async function SiteFooter() {
  const currentYear = new Date().getFullYear();

  // Fetch the canonical CTA section by slug for predictable data
  const ctaSection = await prisma.section.findFirst({
    where: { slug: "cta-default" },
    select: { data: true },
  });

  const channels: any[] = (ctaSection?.data as any)?.channels || [];

  return (
    <footer className="w-full border-t border-border bg-surface">
      <div className="container mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 py-8 sm:flex-row">
        {/* Lightweight CTA */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          {channels.map((channel) => (
            <a
              key={channel.short_label || channel.label}
              href={channel.href}
              className="text-sm text-secondary transition-colors duration-150 hover:text-accent"
            >
              {channel.short_label || channel.label}
            </a>
          ))}
        </div>

        {/* Legal */}
        <div className="flex items-center gap-4 text-sm text-secondary">
          <span>&copy; {currentYear} <span className="text-primary">Fast Dog Coding, LLC.</span></span>
          <a
            href="/legal"
            className="transition-colors duration-150 hover:text-primary"
          >
            Legal
          </a>
          <a
            href="/privacy"
            className="transition-colors duration-150 hover:text-primary"
          >
            Privacy
          </a>
          <a
            href="https://candidate-concierge.fastdogcoding.com/privacy"
            className="transition-colors duration-150 hover:text-primary"
            rel="noopener noreferrer"
          >
            Concierge Privacy
          </a>
        </div>
      </div>
    </footer>
  );
}
