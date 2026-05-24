/**
 * GraphQL Client Query Strings
 *
 * Pre-defined queries for use by RSC page components.
 * These are plain strings (not gql tagged templates) — they'll be sent
 * as the `query` field in fetch POST bodies to /api/graphql.
 */

/** Fetch a single page with all its ordered sections */
export const PAGE_QUERY = `
  query Page($slug: String!, $parentSlug: String) {
    page(slug: $slug, parentSlug: $parentSlug) {
      id
      slug
      parentSlug
      title
      metaDesc
      isPublished
      isNav
      navLabel
      sortOrder
      sections {
        id
        slug
        type
        sortOrder
        displayHint
        data
      }
      createdAt
      updatedAt
    }
  }
`;

/** Fetch child pages of a parent (e.g., gallery projects) */
export const PAGES_QUERY = `
  query Pages($parentSlug: String, $isPublished: Boolean) {
    pages(parentSlug: $parentSlug, isPublished: $isPublished) {
      id
      slug
      parentSlug
      title
      metaDesc
      sortOrder
      sections {
        id
        slug
        type
        sortOrder
        displayHint
        data
      }
    }
  }
`;

/** Fetch all nav-visible pages for SiteHeader */
export const NAV_PAGES_QUERY = `
  query NavPages {
    navPages {
      slug
      navLabel
      sortOrder
    }
  }
`;

/** Fetch a single section by slug */
export const SECTION_QUERY = `
  query Section($slug: String!) {
    section(slug: $slug) {
      id
      slug
      type
      data
      createdAt
      updatedAt
    }
  }
`;

/** Fetch all sections of a given type */
export const SECTIONS_BY_TYPE_QUERY = `
  query SectionsByType($type: String!) {
    sectionsByType(type: $type) {
      id
      slug
      type
      data
      createdAt
      updatedAt
    }
  }
`;
