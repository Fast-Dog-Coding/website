/**
 * CTASection
 *
 * Multi-channel CTA block (LinkedIn, Email, Calendar, Candidate Concierge).
 * Source: TDS § 3 wireframe (lines 499–537)
 */

import type { CtaSectionData } from "@/types";

/** Inline SVG icons for the four CTA channels */
function ChannelIcon({ icon }: { icon: string }) {
  const iconClass = "h-8 w-8 text-secondary transition-colors group-hover:text-accent";

  switch (icon) {
    case "linkedin":
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      );
    case "email":
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
        </svg>
      );
    case "calendar":
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
      );
    case "ai":
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
        </svg>
      );
    default:
      return null;
  }
}

export function CTASection({ data }: { data: Record<string, unknown> }) {
  const { heading, subheading, channels } = data as unknown as CtaSectionData;

  return (
    <section className="w-full py-16 md:py-24">
      <div className="container mx-auto max-w-5xl px-4 text-center">
        <h2 className="text-4xl font-bold tracking-tight text-primary">
          {heading}
        </h2>
        {subheading && (
          <p className="mt-4 text-lg text-secondary">{subheading}</p>
        )}
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {(channels || []).map((channel) => (
            <a
              key={channel.icon}
              href={channel.href}
              target={channel.target}
              rel={channel.rel}
              className="group flex flex-col items-center justify-center gap-3 rounded-lg border border-border bg-surface p-6 text-center transition-colors duration-200 hover:border-accent hover:bg-background"
            >
              <ChannelIcon icon={channel.icon} />
              <span className="font-medium text-primary">
                {channel.label}
              </span>
              <span className="text-sm text-secondary">
                {channel.micro_copy}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
