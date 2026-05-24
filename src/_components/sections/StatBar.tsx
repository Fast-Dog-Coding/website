/**
 * StatBar
 *
 * Horizontal row of labelled metrics.
 * Source: TDS § 2 — section type 'stat_bar'
 */

interface StatItem {
  label: string;
  value: string;
}

interface StatBarData {
  stats: StatItem[];
}

export function StatBar({ data }: { data: Record<string, unknown> }) {
  const { stats } = data as unknown as StatBarData;

  if (!stats?.length) return null;

  return (
    <section className="w-full py-12 md:py-16 bg-surface border-y border-border">
      <div className="container mx-auto max-w-5xl px-4">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-bold text-accent">{stat.value}</p>
              <p className="mt-2 text-sm uppercase tracking-wide text-secondary">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
