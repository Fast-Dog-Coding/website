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

import { BrandLogo } from "@/_components/brand/BrandLogo";
import { HeaderNav } from "@/_components/HeaderNav";
import { gqlFetch } from "@/lib/gql/fetch";
import { NAV_PAGES_QUERY } from "@/lib/gql/queries";
import type { NavPagesQueryResponse } from "@/types";

export async function SiteHeader() {
  const { navPages } = await gqlFetch<NavPagesQueryResponse>(NAV_PAGES_QUERY);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <a
          href="/"
          className="rounded-sm transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <BrandLogo variant="lockup" size="md" />
        </a>
        <HeaderNav navPages={navPages} />
      </div>
    </header>
  );
}
