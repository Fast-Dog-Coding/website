/**
 * GraphQL Type Definitions
 * Source: Technical Design Spec § 2
 *
 * Architecture: M:N reusable sections.
 * Pages compose sections via page_sections join table.
 * Sections are standalone content atoms.
 */

export const typeDefs = `#graphql
  scalar JSON
  scalar DateTime

  type Page {
    id:          ID!
    slug:        String!
    parentSlug:  String
    title:       String!
    metaDesc:    String
    isPublished: Boolean!
    isNav:       Boolean!
    navLabel:    String
    sortOrder:   Int!
    sections:    [Section!]!
    createdAt:   DateTime!
    updatedAt:   DateTime!
  }

  type Section {
    id:          ID!
    slug:        String
    type:        String!
    sortOrder:   Int!
    displayHint: String
    data:        JSON!
    createdAt:   DateTime!
    updatedAt:   DateTime!
  }

  type NavPage {
    slug:      String!
    navLabel:  String!
    sortOrder: Int!
  }

  type Query {
    """Fetch a single page with all its sections (ordered by sort_order)"""
    page(slug: String!, parentSlug: String): Page

    """Fetch all child pages of a parent (e.g., all gallery projects)"""
    pages(parentSlug: String, isPublished: Boolean): [Page!]!

    """Fetch all nav-visible pages for SiteHeader"""
    navPages: [NavPage!]!

    """Fetch a single section by slug"""
    section(slug: String!): Section

    """Fetch all sections of a given type"""
    sectionsByType(type: String!): [Section!]!
  }
`;
