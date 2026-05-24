/**
 * GraphQL Resolvers
 * Source: Technical Design Spec § 2 — Resolver Map
 *
 * Architecture: M:N reusable sections via page_sections join table.
 * The page resolver joins through page_sections to return an ordered
 * sections array, preserving the same response shape for clients.
 *
 * JSON and DateTime scalars are pass-through (Prisma handles serialization).
 */

import { prisma } from "@/lib/prisma";
import { GraphQLScalarType, Kind } from "graphql";
import type {
  PageQueryArgs,
  PagesQueryArgs,
  SectionQueryArgs,
  SectionsByTypeArgs,
} from "@/types";

// ── Custom Scalars ──

const JSONScalar: GraphQLScalarType<unknown, unknown> = new GraphQLScalarType({
  name: "JSON",
  description: "Arbitrary JSON value",
  serialize: (value: unknown) => value,
  parseValue: (value: unknown) => value,
  parseLiteral: (ast) => {
    switch (ast.kind) {
      case Kind.STRING:
        return JSON.parse(ast.value);
      case Kind.INT:
        return parseInt(ast.value, 10);
      case Kind.FLOAT:
        return parseFloat(ast.value);
      case Kind.BOOLEAN:
        return ast.value;
      case Kind.NULL:
        return null;
      case Kind.OBJECT:
        return ast.fields.reduce(
          (obj: Record<string, unknown>, field) => {
            obj[field.name.value] = JSONScalar.parseLiteral(field.value);
            return obj;
          },
          {}
        );
      case Kind.LIST:
        return ast.values.map((value) => JSONScalar.parseLiteral(value));
      default:
        return null;
    }
  },
});

const DateTimeScalar = new GraphQLScalarType<Date, string>({
  name: "DateTime",
  description: "ISO 8601 datetime string",
  serialize: (value: unknown): string => {
    if (value instanceof Date) return value.toISOString();
    if (typeof value === "string") return value;
    throw new Error(`DateTime cannot serialize non-date value: ${value}`);
  },
  parseValue: (value: unknown): Date => {
    if (typeof value === "string") return new Date(value);
    if (value instanceof Date) return value;
    throw new Error(`DateTime cannot parse non-string value: ${value}`);
  },
  parseLiteral: (ast): Date => {
    if (ast.kind === Kind.STRING) return new Date(ast.value);
    throw new Error(`DateTime literal must be a string, got ${ast.kind}`);
  },
});

// ── Helpers ──

/**
 * Transform a page with pageSections into the flat sections array
 * expected by the GraphQL schema. Carries sortOrder and displayHint
 * from the join table onto each section.
 */
function flattenPageSections(page: {
  pageSections: Array<{
    sortOrder: number;
    displayHint: string | null;
    section: Record<string, unknown>;
  }>;
  [key: string]: unknown;
}) {
  const { pageSections, ...rest } = page;
  return {
    ...rest,
    sections: pageSections.map((ps) => ({
      ...ps.section,
      sortOrder: ps.sortOrder,
      displayHint: ps.displayHint,
    })),
  };
}

// ── Resolvers ──

export const resolvers = {
  JSON: JSONScalar,
  DateTime: DateTimeScalar,

  Query: {
    /**
     * Fetch a single page by slug, with optional parentSlug filter.
     * Includes all sections ordered by sort_order via the join table.
     */
    page: async (_parent: unknown, args: PageQueryArgs) => {
      const where: { slug: string; parentSlug?: string | null } = {
        slug: args.slug,
      };

      if (args.parentSlug !== undefined) {
        where.parentSlug = args.parentSlug;
      }

      const page = await prisma.page.findFirst({
        where,
        include: {
          pageSections: {
            orderBy: { sortOrder: "asc" },
            include: { section: true },
          },
        },
      });

      if (!page) return null;
      return flattenPageSections(page);
    },

    /**
     * Fetch pages by parentSlug and/or isPublished filter.
     * Used by GalleryGrid to fetch child pages.
     */
    pages: async (_parent: unknown, args: PagesQueryArgs) => {
      const where: { parentSlug?: string; isPublished?: boolean } = {};

      if (args.parentSlug !== undefined) {
        where.parentSlug = args.parentSlug;
      }
      if (args.isPublished !== undefined) {
        where.isPublished = args.isPublished;
      }

      const pages = await prisma.page.findMany({
        where,
        orderBy: { sortOrder: "asc" },
        include: {
          pageSections: {
            orderBy: { sortOrder: "asc" },
            include: { section: true },
          },
        },
      });

      return pages.map(flattenPageSections);
    },

    /**
     * Fetch all nav-visible pages for SiteHeader.
     * Returns only slug, navLabel, and sortOrder.
     */
    navPages: async () => {
      return prisma.page.findMany({
        where: { isNav: true },
        orderBy: { sortOrder: "asc" },
        select: {
          slug: true,
          navLabel: true,
          sortOrder: true,
        },
      });
    },

    /**
     * Fetch a single section by its slug.
     * Useful for direct section access (e.g., SiteFooter fetching CTA data).
     */
    section: async (_parent: unknown, args: SectionQueryArgs) => {
      return prisma.section.findUnique({
        where: { slug: args.slug },
      });
    },

    /**
     * Fetch all sections of a given type.
     * Useful for aggregation views (e.g., all testimonials).
     */
    sectionsByType: async (_parent: unknown, args: SectionsByTypeArgs) => {
      return prisma.section.findMany({
        where: { type: args.type },
      });
    },
  },
};
