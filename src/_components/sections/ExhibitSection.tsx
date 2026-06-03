/**
 * ExhibitSection
 *
 * Self-contained project showcase: title heading, executive plaque
 * (role, lede, tech stack), and narrative sections (challenge, approach, impact).
 *
 * Replaces the old hero + curated_exhibit_plaque + prose pattern with
 * a single well-typed section.
 */

import ReactMarkdown from "react-markdown";
import { Tag } from "@/_components/ui/Tag";
import type { ExhibitData } from "@/types";

export function ExhibitSection({
  data,
}: {
  data: Record<string, unknown>;
  displayHint?: string | null;
}) {
  const { title, client, role, lede, challenge, approach, impact, tech_stack } =
    data as unknown as ExhibitData;

  return (
    <>
      {/* Hero heading */}
      <section className="w-full py-24 md:py-32">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tighter text-primary">
            {title}
          </h1>
          {lede && (
            <p className="mt-4 text-lg md:text-xl text-secondary">{lede}</p>
          )}
        </div>
      </section>

      {/* Content Grid: Plaque + Narrative */}
      <section className="w-full py-12 md:py-16">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-1 items-start gap-12 md:grid-cols-12">
            
            {/* Left Column: Sticky Executive Plaque */}
            <aside className="md:col-span-4 lg:col-span-3 md:sticky md:top-32">
              <div className="flex flex-col gap-8 rounded-2xl border border-border bg-surface p-6 md:p-8">
                {/* 1: Role */}
                <div className="flex flex-col gap-2">
                  <h3 className="font-mono text-xs uppercase tracking-widest text-secondary">
                    Role
                  </h3>
                  <p className="text-lg font-medium text-primary">{role}</p>
                </div>

                {/* 2: Client */}
                <div className="flex flex-col gap-2">
                  <h3 className="font-mono text-xs uppercase tracking-widest text-secondary">
                    Client
                  </h3>
                  <p className="text-lg font-medium text-primary">{client}</p>
                </div>

                {/* 3: Tech Stack */}
                <div className="flex flex-col gap-3">
                  <h3 className="font-mono text-xs uppercase tracking-widest text-secondary">
                    Tech Stack
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(tech_stack || []).map((tech) => (
                      <Tag key={tech}>{tech}</Tag>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* Right Column: Narrative Sections */}
            <div className="md:col-span-8 lg:col-span-9">
              <div className="prose-fdc space-y-12">
                {challenge && (
                  <div>
                    <ReactMarkdown>{`## The Challenge\n\n${challenge}`}</ReactMarkdown>
                  </div>
                )}
                {approach && (
                  <div>
                    <ReactMarkdown>{`## The Approach\n\n${approach}`}</ReactMarkdown>
                  </div>
                )}
                {impact && (
                  <div>
                    <ReactMarkdown>{`## The Impact\n\n${impact}`}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
