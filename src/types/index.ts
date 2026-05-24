/**
 * Shared TypeScript Types
 *
 * Domain types used across the application.
 * These mirror the Prisma models but are decoupled from the ORM —
 * used by GraphQL resolvers, section components, and data fetching.
 */

// ── GraphQL Resolver Argument Types ──

/** Arguments for Query.page */
export interface PageQueryArgs {
  slug: string;
  parentSlug?: string;
}

/** Arguments for Query.pages */
export interface PagesQueryArgs {
  parentSlug?: string;
  isPublished?: boolean;
}

/** Arguments for Query.section */
export interface SectionQueryArgs {
  slug: string;
}

/** Arguments for Query.sectionsByType */
export interface SectionsByTypeArgs {
  type: string;
}

// ── Domain Types (mirror Prisma models) ──

/** A page record — routing shell for a URL */
export interface PageRecord {
  id: string;
  slug: string;
  parentSlug: string | null;
  title: string;
  metaDesc: string | null;
  isPublished: boolean;
  isNav: boolean;
  navLabel: string | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  sections: SectionRecord[];
}

/**
 * A section record — standalone content atom.
 *
 * `sortOrder` and `displayHint` come from the page_sections join table
 * when a section is fetched in the context of a page. They represent
 * the section's position and rendering mode on that specific page.
 */
export interface SectionRecord {
  id: string;
  slug: string | null;
  type: string;
  sortOrder: number;
  displayHint: string | null;
  data: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

/** A nav page projection — minimal data for SiteHeader */
export interface NavPageRecord {
  slug: string;
  navLabel: string | null;
  sortOrder: number;
}

// ── Section Data Shapes ──

/** Exhibit section data (JSONB) */
export interface ExhibitData {
  title: string;
  client: string;
  role: string;
  lede: string;
  challenge: string;
  approach: string;
  impact: string;
  tech_stack: string[];
}

/** Testimonial section data (JSONB) */
export interface TestimonialData {
  name: string;
  role: string;
  company: string;
  content: string;
  snippets: string[];
}

// ── GraphQL Response Types ──

/** Shape returned by the page() GraphQL query */
export interface PageQueryResponse {
  page: PageRecord | null;
}

/** Shape returned by the pages() GraphQL query */
export interface PagesQueryResponse {
  pages: PageRecord[];
}

/** Shape returned by the navPages() GraphQL query */
export interface NavPagesQueryResponse {
  navPages: NavPageRecord[];
}
