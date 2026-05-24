/**
 * SiteHeader
 *
 * Sticky navigation header with data-driven nav links.
 * Source: TDS § 3 wireframe (lines 542–555)
 *
 * Architecture:
 *   - Server Component fetches nav pages via GraphQL
 *   - Client Component handles active link state + mobile menu
 */

import { gqlFetch } from "@/lib/gql/fetch";
import { NAV_PAGES_QUERY } from "@/lib/gql/queries";
import type { NavPagesQueryResponse } from "@/types";
import { HeaderNav } from "@/_components/HeaderNav";

export async function SiteHeader() {
  const { navPages } = await gqlFetch<NavPagesQueryResponse>(NAV_PAGES_QUERY);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <a href="/" className="font-mono text-lg font-semibold text-primary">
          Fast Dog Coding
        </a>
        <HeaderNav navPages={navPages} />
      </div>
    </header>
  );
}
