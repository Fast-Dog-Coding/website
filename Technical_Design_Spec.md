# Technical Design Specification (TDS) for Fast Dog Coding Website

> **Architecture Decision — Server-Driven UI (SDUI)**
> Sections 1 and 2 reflect an owner-directed architectural revision adopted after the initial blueprint pass.
> The core principle: the application defines a vocabulary of section types in code; the database composes
> pages from that vocabulary. Adding a new page requires zero code — only a database record. Adding a new
> *type* of section requires one new component file. The renderer is agnostic to page content.

## Summary Table

| Major Deliverable                | TDS Section                  |
|----------------------------------|------------------------------|
| Next.js App Structure            | ## 1. Next.js App Structure  |
| Database & API Layer             | ## 2. Database & API Layer   |
| Design System & Tailwind Config  | ## 3. Design System & Tailwind Config |
| Production Copy                  | ## 4. Production Copy        |
| Open Questions & Conflicts       | ## 5. Open Questions & Conflicts |

---

## 1. Next.js App Structure

### Architecture Note

The routing model is **universally data-driven**. Every page — including the home page — is a record
in the `pages` table composed from rows in the `sections` table. The Next.js file tree is minimal
and fixed; the site's content and structure live entirely in the database.

- **`app/page.tsx`** — Fetches the page record where `slug = 'home'` and delegates to `SectionRenderer`.
- **`app/[page-id]/page.tsx`** — Universal handler for all top-level pages (about, services, contact, gallery, testimonials, legal, privacy, and any future page).
- **`app/[page-id]/[child-id]/page.tsx`** — Universal handler for all child pages (individual project showcases, and any future nested content).
- **`app/layout.tsx`** — Root shell only: `SiteHeader` + `SiteFooter`. These two components are infrastructure, not content sections. `SiteHeader` queries `pages WHERE is_nav = true ORDER BY sort_order` to build the nav dynamically.

Next.js resolves static route segments (`app/page.tsx`) before dynamic ones (`[page-id]`),
so there is no conflict between the home route and the catch-all.

### File Tree

```plaintext
app/
├── layout.tsx                        # Root shell: SiteHeader + SiteFooter
├── page.tsx                          # Home — fetches slug='home', renders SectionRenderer
├── loading.tsx
├── error.tsx
├── [page-id]/
│   ├── page.tsx                      # Universal top-level page renderer
│   ├── loading.tsx
│   ├── error.tsx
│   └── [child-id]/
│       ├── page.tsx                  # Universal child page renderer
│       ├── loading.tsx
│       └── error.tsx
└── api/
    └── revalidate/
        └── route.ts                  # Protected POST: triggers on-demand ISR after DB writes

_components/
├── SectionRenderer.tsx               # The "browser engine": maps section.type → Component
├── sections/                         # One file per section type (the "vocabulary")
│   ├── HeroSection.tsx
│   ├── ProseSection.tsx
│   ├── GalleryGrid.tsx
│   ├── CuratedExhibitPlaque.tsx
│   ├── CTASection.tsx
│   ├── PullQuote.tsx
│   ├── StatBar.tsx
│   └── TestimonialGrid.tsx
├── SiteHeader.tsx                    # Global chrome — not a section type
├── SiteFooter.tsx                    # Global chrome — not a section type
└── ui/                               # Primitive atoms shared across sections
    ├── Button.tsx
    ├── Card.tsx
    └── Tag.tsx
```

### Component Inventory

| Component | Location | Responsibility |
|---|---|---|
| `SectionRenderer` | `_components/SectionRenderer.tsx` | Maps `section.type` to its React component. Silently skips unknown types (browser-like). |
| `HeroSection` | `_components/sections/HeroSection.tsx` | Renders H1, sub-headline, and primary CTA. Validates `data` against `HeroSchema` (Zod). |
| `ProseSection` | `_components/sections/ProseSection.tsx` | Renders a Markdown body field. Used for long-form content pages. |
| `GalleryGrid` | `_components/sections/GalleryGrid.tsx` | Queries child pages (`parent_slug = 'gallery'`) and renders a grid of `ProjectCard` atoms. |
| `CuratedExhibitPlaque` | `_components/sections/CuratedExhibitPlaque.tsx` | Renders the Executive Impact Summary: Outcome, Tech Stack, Role. The semantic unit for project detail pages. |
| `CTASection` | `_components/sections/CTASection.tsx` | Renders the four-channel CTA block (LinkedIn, Email, Calendar, AI Concierge). |
| `PullQuote` | `_components/sections/PullQuote.tsx` | Single testimonial quote with attribution. |
| `StatBar` | `_components/sections/StatBar.tsx` | Horizontal row of labelled metrics (e.g., "65% latency reduction"). |
| `TestimonialGrid` | `_components/sections/TestimonialGrid.tsx` | Grid of multiple testimonial cards for the main testimonials page. |
| `SiteHeader` | `_components/SiteHeader.tsx` | Sticky header. Queries `pages WHERE is_nav = true` for nav links. Not a section type. |
| `SiteFooter` | `_components/SiteFooter.tsx` | Footer with lightweight CTA links and legal nav. Not a section type. |
| `Button` | `_components/ui/Button.tsx` | Atom: accent-colored CTA button with hover/focus states. |
| `Card` | `_components/ui/Card.tsx` | Atom: bordered surface card with lift-on-hover. Used by `GalleryGrid`. |
| `Tag` | `_components/ui/Tag.tsx` | Atom: tech stack pill label. Used by `CuratedExhibitPlaque` and `GalleryGrid`. |

### Adding a New Section Type

1. Create `_components/sections/MyNewSection.tsx` with its Zod schema and component.
2. Add one line to `SectionRenderer.tsx`: `my_new_section: MyNewSection`.
3. Insert DB rows with `type = 'my_new_section'` and valid `data` JSONB.

No route files, no page files, no layout changes required.

### Data Fetching Strategy

| Route | Fetching Method | Query |
|---|---|---|
| `/` | RSC + ISR (on-demand) | `query { page(slug: "home") { sections { type, data } } }` |
| `/[page-id]` | RSC + ISR (on-demand) | `query { page(slug: $pageId) { sections { type, data } } }` |
| `/[page-id]/[child-id]` | RSC + ISR (on-demand) | `query { page(slug: $childId, parentSlug: $pageId) { sections { type, data } } }` |
| `SiteHeader` | RSC + ISR (on-demand) | `query { navPages { slug, navLabel, sortOrder } }` |
| `GalleryGrid` (section) | RSC (within parent render) | `query { pages(parentSlug: "gallery") { slug, sections { type, data } } }` |

**ISR strategy:** `export const revalidate = false` on all page routes (fully static after first render).
A `POST /api/revalidate` route (token-protected) calls `revalidatePath()` after any DB write.
This is the Phase 2 editor's save hook, and can also be triggered by a DB-level webhook.

### State Management

- **Phase 2 Live Editing**: A React Context (`EditModeContext`) toggled by authenticated session. When active, section components render an edit affordance (button or overlay) that opens the section's `data` JSONB for editing. The editor is a future implementation concern — inline, separate CMS page, or standalone app are all viable approaches.
- **Navigation active state**: Local `usePathname()` hook in `SiteHeader`. No global state needed.

---

## 2. Database & API Layer

### Architecture Note

The data model has two layers:

- **`pages`** — one row per URL. Holds routing metadata (`slug`, `parent_slug`), SEO fields, and nav configuration. Has no content columns of its own.
- **`sections`** — one row per rendered block on a page. `type` is the vocabulary term (maps 1:1 to a React component). `data` is a JSONB payload whose schema is defined by, and validated within, the corresponding component (Zod). `sort_order` controls render sequence.

This replaces the previous flat `case_studies` + `content_blocks` model. Project showcases are now pages with `parent_slug = 'gallery'` and a `curated_exhibit_plaque` section.

### PostgreSQL DDL

```sql
-- Extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- The document layer: one row per URL
CREATE TABLE pages (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         VARCHAR(255) UNIQUE NOT NULL,
  parent_slug  VARCHAR(255) REFERENCES pages(slug) ON DELETE CASCADE,
  title        VARCHAR(500) NOT NULL,
  meta_desc    TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  is_nav       BOOLEAN NOT NULL DEFAULT false,   -- include in SiteHeader nav
  nav_label    VARCHAR(100),                     -- display text in nav (if is_nav)
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- The element layer: one row per rendered block
CREATE TABLE sections (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id     UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  type        VARCHAR(100) NOT NULL,    -- vocabulary term: 'hero', 'prose', 'gallery_grid', etc.
  sort_order  INTEGER NOT NULL DEFAULT 0,
  data        JSONB NOT NULL DEFAULT '{}',  -- payload; schema defined per-component (Zod)
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_pages_slug        ON pages(slug);
CREATE INDEX idx_pages_parent_slug ON pages(parent_slug);
CREATE INDEX idx_pages_is_nav      ON pages(is_nav) WHERE is_nav = true;
CREATE INDEX idx_sections_page_id  ON sections(page_id, sort_order);
CREATE INDEX idx_sections_type     ON sections(type);
```

**Section vocabulary (initial):**

| `type` value | Component | `data` payload keys |
|---|---|---|
| `hero` | `HeroSection` | `heading`, `subheading`, `cta_label`, `cta_href` |
| `prose` | `ProseSection` | `markdown` |
| `gallery_grid` | `GalleryGrid` | `parent_slug` (which child pages to query) |
| `curated_exhibit_plaque` | `CuratedExhibitPlaque` | `outcome`, `tech_stack[]`, `role`, `testimonial?{ quote, attribution }` |
| `cta` | `CTASection` | `heading`, `subheading`, `channels[]{ label, href, icon, micro_copy }` |
| `pull_quote` | `PullQuote` | `quote`, `attribution` |
| `stat_bar` | `StatBar` | `stats[]{ label, value }` |
| `testimonial_grid` | `TestimonialGrid` | `testimonials[]{ quote, attribution, role }` |

### Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Page {
  id          String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  slug        String    @unique @db.VarChar(255)
  parentSlug  String?   @db.VarChar(255)  @map("parent_slug")
  parent      Page?     @relation("PageChildren", fields: [parentSlug], references: [slug])
  children    Page[]    @relation("PageChildren")
  title       String    @db.VarChar(500)
  metaDesc    String?   @map("meta_desc")
  isPublished Boolean   @default(false)   @map("is_published")
  isNav       Boolean   @default(false)   @map("is_nav")
  navLabel    String?   @db.VarChar(100)  @map("nav_label")
  sortOrder   Int       @default(0)       @map("sort_order")
  createdAt   DateTime  @default(now())   @map("created_at")
  updatedAt   DateTime  @updatedAt        @map("updated_at")
  sections    Section[]

  @@map("pages")
}

model Section {
  id         String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  pageId     String   @db.Uuid  @map("page_id")
  page       Page     @relation(fields: [pageId], references: [id], onDelete: Cascade)
  type       String   @db.VarChar(100)
  sortOrder  Int      @default(0)  @map("sort_order")
  data       Json     @default("{}")
  createdAt  DateTime @default(now())  @map("created_at")
  updatedAt  DateTime @updatedAt       @map("updated_at")

  @@index([pageId, sortOrder])
  @@map("sections")
}
```

### GraphQL SDL

```graphql
scalar JSON
scalar DateTime

type Page {
  id:          ID!
  slug:        String!
  parentSlug:  String
  parent:      Page
  children:    [Page!]!
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
  id:        ID!
  pageId:    ID!
  type:      String!   # vocabulary term; maps to a React component in SectionRenderer
  sortOrder: Int!
  data:      JSON!     # payload; schema enforced per-component via Zod at render time
  createdAt: DateTime!
  updatedAt: DateTime!
}

type NavPage {
  slug:      String!
  navLabel:  String!
  sortOrder: Int!
}

type Query {
  # Fetch a single page with all its sections
  page(slug: String!, parentSlug: String): Page

  # Fetch all child pages of a parent (e.g., all gallery projects)
  pages(parentSlug: String, isPublished: Boolean): [Page!]!

  # Fetch all nav-visible pages for SiteHeader
  navPages: [NavPage!]!
}

input UpsertSectionInput {
  id:        ID          # omit to create; provide to update
  pageId:    ID!
  type:      String!
  sortOrder: Int!
  data:      JSON!
}

input ReorderSectionsInput {
  pageId:    ID!
  sectionIds: [ID!]!    # ordered list of section IDs = new sort_order
}

type MutationPayload {
  success:   Boolean!
  updatedAt: DateTime!
}

type Mutation {
  # Phase 2: upsert a section's data payload (authenticated)
  upsertSection(input: UpsertSectionInput!): Section!

  # Phase 2: reorder sections on a page (authenticated)
  reorderSections(input: ReorderSectionsInput!): MutationPayload!

  # Phase 2: publish/unpublish a page (authenticated)
  setPagePublished(slug: String!, published: Boolean!): MutationPayload!
}
```

### Resolver Map

| Resolver | DB Query | Auth Required |
|---|---|---|
| `Query.page` | `SELECT * FROM pages WHERE slug=$1 AND (parent_slug=$2 OR $2 IS NULL)` + `SELECT * FROM sections WHERE page_id=$id ORDER BY sort_order` | No |
| `Query.pages` | `SELECT * FROM pages WHERE parent_slug=$1 AND is_published=true ORDER BY sort_order` | No |
| `Query.navPages` | `SELECT slug, nav_label, sort_order FROM pages WHERE is_nav=true ORDER BY sort_order` | No |
| `Mutation.upsertSection` | `INSERT INTO sections ... ON CONFLICT (id) DO UPDATE SET data=$data, sort_order=$order, updated_at=now()` | Yes |
| `Mutation.reorderSections` | Batch `UPDATE sections SET sort_order=$i WHERE id=$id` | Yes |
| `Mutation.setPagePublished` | `UPDATE pages SET is_published=$1, updated_at=now() WHERE slug=$2` | Yes |

---

## 3. Design System & Tailwind Config

### Tailwind Theme Extension (`tailwind.config.ts`)

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    // ... your content paths
  ],
  theme: {
    extend: {
      colors: {
        'background': '#111111', // Primary dark background
        'surface': '#1A1A1A',    // Card and panel backgrounds
        'border': '#2D2D2D',    // Subtle borders and dividers
        'primary': '#F5F5F5',   // Primary text, headings
        'secondary': '#A3A3A3', // Sub-text, metadata, disabled states
        'accent': '#BE9541',    // The "warm handshake" accent for CTAs and highlights
        'accent-hover': '#D1A758', // Lighter accent for hover states
      },
      fontFamily: {
        sans: ['Geist Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'monospace'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],       // 12px
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],   // 14px
        'base': ['1rem', { lineHeight: '1.5rem' }],       // 16px
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],   // 18px
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
        '2xl': ['1.5rem', { lineHeight: '2rem' }],       // 24px
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 36px
        '5xl': ['3rem', { lineHeight: '1.1' }],         // 48px
        '6xl': ['3.75rem', { lineHeight: '1' }],        // 60px
      },
      fontWeight: {
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
      borderRadius: {
        'sm': '0.125rem', // 2px
        'md': '0.25rem',  // 4px
        'lg': '0.5rem',   // 8px
        'xl': '1rem',     // 16px
      },
      boxShadow: {
        'lift': '0 4px 12px rgba(0, 0, 0, 0.25)',
        'accent-glow': '0 0 12px rgba(190, 149, 65, 0.4)',
      },
    },
  },
  plugins: [],
}
export default config
```

### Component Wireframe Specifications

#### `HeroSection`

```html
<!-- HeroSection Container -->
<section class="w-full py-24 md:py-32">
  <div class="container mx-auto max-w-4xl px-4 text-center">
    <!-- H1 Headline -->
    <h1 class="text-5xl md:text-6xl font-bold tracking-tighter text-primary">
      Principal-Level Systems Architecture
    </h1>
    <!-- Sub-headline -->
    <p class="mt-4 text-lg md:text-xl text-secondary">
      Translating complex business requirements into scalable, performant, and maintainable software solutions.
    </p>
    <!-- Primary CTA -->
    <a href="/gallery" class="mt-8 inline-flex h-12 items-center justify-center rounded-lg bg-accent px-8 text-base font-semibold text-background shadow-accent-glow transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background">
      Explore the Showcases
    </a>
  </div>
</section>
```

#### `GalleryTeaser`

```html
<!-- GalleryTeaser Container -->
<section class="w-full py-16 md:py-24 bg-surface border-y border-border">
  <div class="container mx-auto max-w-7xl px-4">
    <!-- Section Title -->
    <h2 class="text-4xl font-bold tracking-tight text-primary text-center">
      Featured Case Studies
    </h2>
    <!-- Grid Container -->
    <div class="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
      <!-- ProjectCard component repeats here -->
      <!-- [ProjectCard] -->
      <!-- [ProjectCard] -->
      <!-- [ProjectCard] -->
    </div>
  </div>
</section>
```

#### `ProjectCard`

```html
<!-- ProjectCard Root -->
<a href="/project-url" class="group block rounded-lg border border-border bg-background p-6 transition-all duration-200 hover:border-accent hover:shadow-lift md:p-8">
  <div class="flex flex-col gap-4">
    <!-- Project Title -->
    <h3 class="text-2xl font-semibold text-primary">
      Project Title
    </h3>
    <!-- Client / Context -->
    <p class="text-base text-secondary">
      Client Name / Context
    </p>
    <!-- One-Sentence Impact Summary -->
    <p class="text-base text-primary">
      A curated, one-sentence narrative hook summarizing the project's core impact.
    </p>
    <!-- Tech Stack Tags -->
    <div class="mt-2 flex flex-wrap gap-2">
      <span class="rounded-md bg-surface px-3 py-1 text-sm font-medium text-secondary">Next.js</span>
      <span class="rounded-md bg-surface px-3 py-1 text-sm font-medium text-secondary">GraphQL</span>
      <span class="rounded-md bg-surface px-3 py-1 text-sm font-medium text-secondary">PostgreSQL</span>
    </div>
  </div>
</a>
```

#### `CuratedExhibitPlaque` (Executive Impact Summary)

```html
<!-- CuratedExhibitPlaque Container -->
<div class="mt-12 mb-16 border-y border-border py-12">
  <div class="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
    <!-- Column 1: Outcome -->
    <div class="flex flex-col gap-2">
      <h3 class="font-mono text-sm uppercase tracking-widest text-secondary">
        Measurable Outcome
      </h3>
      <p class="text-xl font-medium text-primary">
        Reduced API latency by 65% and increased developer velocity by 20% through strategic system refactoring.
      </p>
    </div>
    <!-- Column 2: Tech Stack -->
    <div class="flex flex-col gap-2">
      <h3 class="font-mono text-sm uppercase tracking-widest text-secondary">
        Tech Stack
      </h3>
      <p class="text-xl font-medium text-primary">
        Next.js, TypeScript, GraphQL, PostgreSQL, Docker, AWS ECS
      </p>
    </div>
    <!-- Column 3: Role -->
    <div class="flex flex-col gap-2">
      <h3 class="font-mono text-sm uppercase tracking-widest text-secondary">
        My Role
      </h3>
      <p class="text-xl font-medium text-primary">
        Lead Architect & Principal Engineer
      </p>
    </div>
  </div>
</div>
```

#### `MultiChannelCTA`

```html
<!-- MultiChannelCTA Container -->
<section class="w-full py-16 md:py-24">
  <div class="container mx-auto max-w-5xl px-4 text-center">
    <h2 class="text-4xl font-bold tracking-tight text-primary">
      Let's Connect
    </h2>
    <p class="mt-4 text-lg text-secondary">
      Choose the channel that works best for you.
    </p>
    <!-- Grid Container -->
    <div class="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <!-- CTA Item 1: LinkedIn -->
      <a href="#" class="group flex flex-col items-center justify-center gap-3 rounded-lg border border-border bg-surface p-6 text-center transition-colors hover:border-accent hover:bg-background">
        <!-- Icon Placeholder -->
        <svg class="h-8 w-8 text-secondary transition-colors group-hover:text-accent" fill="currentColor" viewBox="0 0 24 24"><!-- ... --></svg>
        <span class="font-medium text-primary">Ping me on LinkedIn</span>
      </a>
      <!-- CTA Item 2: Email -->
      <a href="#" class="group flex flex-col items-center justify-center gap-3 rounded-lg border border-border bg-surface p-6 text-center transition-colors hover:border-accent hover:bg-background">
        <!-- Icon Placeholder -->
        <svg class="h-8 w-8 text-secondary transition-colors group-hover:text-accent" fill="currentColor" viewBox="0 0 24 24"><!-- ... --></svg>
        <span class="font-medium text-primary">Send an email</span>
      </a>
      <!-- CTA Item 3: Calendar -->
      <a href="#" class="group flex flex-col items-center justify-center gap-3 rounded-lg border border-border bg-surface p-6 text-center transition-colors hover:border-accent hover:bg-background">
        <!-- Icon Placeholder -->
        <svg class="h-8 w-8 text-secondary transition-colors group-hover:text-accent" fill="currentColor" viewBox="0 0 24 24"><!-- ... --></svg>
        <span class="font-medium text-primary">Book 25 minutes</span>
      </a>
      <!-- CTA Item 4: AI Concierge -->
      <a href="#" class="group flex flex-col items-center justify-center gap-3 rounded-lg border border-border bg-surface p-6 text-center transition-colors hover:border-accent hover:bg-background">
        <!-- Icon Placeholder -->
        <svg class="h-8 w-8 text-secondary transition-colors group-hover:text-accent" fill="currentColor" viewBox="0 0 24 24"><!-- ... --></svg>
        <span class="font-medium text-primary">Ask my AI Concierge</span>
      </a>
    </div>
  </div>
</section>
```

#### `SiteHeader` and `SiteFooter`

```html
<!-- SiteHeader -->
<header class="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-sm">
  <div class="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
    <a href="/" class="font-mono text-lg font-semibold text-primary">
      Fast Dog Coding
    </a>
    <nav class="hidden items-center gap-6 md:flex">
      <a href="/gallery" class="text-base font-medium text-secondary transition-colors hover:text-primary">Gallery</a>
      <a href="/services" class="text-base font-medium text-secondary transition-colors hover:text-primary">Services</a>
      <a href="/about" class="text-base font-medium text-secondary transition-colors hover:text-primary">About</a>
      <a href="/contact" class="text-base font-medium text-secondary transition-colors hover:text-primary">Contact</a>
    </nav>
  </div>
</header>

<!-- SiteFooter -->
<footer class="w-full border-t border-border bg-surface">
  <div class="container mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 py-8 sm:flex-row">
    <!-- Lightweight CTA -->
    <div class="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
      <a href="#" class="text-sm text-secondary transition-colors hover:text-accent">LinkedIn</a>
      <a href="#" class="text-sm text-secondary transition-colors hover:text-accent">Email</a>
      <a href="#" class="text-sm text-secondary transition-colors hover:text-accent">Calendar</a>
    </div>
    <!-- Legal Links -->
    <div class="flex items-center gap-4 text-sm text-secondary">
      <span>&copy; 2024 Fast Dog Coding</span>
      <a href="/legal" class="transition-colors hover:text-primary">Legal</a>
      <a href="/privacy" class="transition-colors hover:text-primary">Privacy</a>
    </div>
  </div>
</footer>
```

### Motion Budget

| Element(s) | Trigger | CSS Property(s) | `transition` Value |
| :--- | :--- | :--- | :--- |
| Primary CTA Button | `hover`, `focus` | `background-color` | `transition-colors duration-200 ease-in-out` |
| Navigation Links | `hover` | `color` | `transition-colors duration-150 ease-in-out` |
| Project Card | `hover` | `border-color`, `box-shadow` | `transition-all duration-200 ease-in-out` |
| CTA Items | `hover` | `border-color`, `background-color` | `transition-colors duration-200 ease-in-out` |
| CTA Item Icons | `group-hover` | `color` | `transition-colors duration-200 ease-in-out` |
| Footer Links | `hover` | `color` | `transition-colors duration-150 ease-in-out` |

---

## 4. Production Copy

### Home Page

**H1**
Principal-Level Architecture. Enterprise-Grade Execution.

**Sub-headline**
I design and build the robust, scalable digital foundations that drive your business forward.

**CTA Label**
Explore the Showcases

**Gallery Teaser Section Header**
Curated Showcases

**Testimonial Pull-Quote**
"His architectural foresight saved us six months of rework and set a new standard for our platform."

**Footer Tagline**
Fast Dog Coding. Built to last.

### Gallery Page (`/gallery`)

**Page Title**
Showcases

**Section Intro**
Each project represents a distinct challenge and a tailored architectural solution. The common thread is a relentless focus on performance, scalability, and measurable business impact. This is a curated selection of work that demonstrates a commitment to technical excellence under real-world constraints.

### About Page (`/about`)

Hello, I'm the architect and principal engineer behind Fast Dog Coding. For over a decade, I've partnered with enterprise clients and ambitious startups to solve complex technical challenges. My work lives at the intersection of pragmatic engineering and strategic business vision. I build systems that are not only technically elegant but also resilient, scalable, and aligned with long-term goals.

I take my work seriously. I don't take myself seriously.

**The Origin Story**

People often ask about the name. It comes from a retired racing greyhound I adopted years ago. His name was Dash. On the track, he was an explosive athlete, all focused, efficient power. At home, he was the laziest creature you’ve ever met—a master of conserving energy.

That duality struck me as the perfect metaphor for great software architecture. It should be incredibly powerful and fast when it needs to be, but also calm, efficient, and stable at rest. It’s about applying force intelligently, not wastefully. So, Fast Dog Coding isn't about rushing; it's about building with focused, purposeful speed.

(And yes, a picture of the original Fast Dog may appear here one day, pending his approval.)

**My Philosophy**

My approach is simple: listen intently, think deeply, and build deliberately. I believe the best solutions emerge from a clear understanding of the problem, not a blind attachment to a particular technology. I function as a partner, not just a contractor, embedding with your team to provide technical leadership and mentorship that lasts beyond the engagement.

When I’m not designing systems, you can find me exploring backcountry trails or trying to figure out why my 3D prints keep failing.

Speaking of which, why do programmers prefer dark mode?

Because light attracts bugs.

### Services Page (`/services`)

**Page Headline**
Capabilities & Engagements

**Core Capabilities**

**Full-Stack Architecture & Design**
From greenfield system design to refactoring legacy platforms, I create comprehensive architectural blueprints that ensure scalability, security, and maintainability for the full technology stack.

**API Design & Integration**
I specialize in designing and implementing clean, robust, and well-documented APIs (REST, GraphQL) that serve as the reliable backbone for your applications and third-party integrations.

**Performance Optimization & Scalability**
I identify and resolve performance bottlenecks in existing applications, re-architecting systems for high-throughput, low-latency environments to handle enterprise-level scale.

**Technical Leadership & Team Mentorship**
Acting as a force multiplier, I provide senior-level guidance, establish best practices, conduct code reviews, and mentor engineering teams to elevate their technical capabilities.

**Engagement Models**

**1099 Contract Engagements**
For well-defined, long-term projects requiring dedicated architectural leadership and hands-on development. I integrate directly with your team to drive technical initiatives from concept to completion.

**Advisory & Retainer**
For organizations needing ongoing, high-level technical guidance. This model provides consistent access for strategic planning, architectural reviews, and critical decision-making support without a full-time commitment.

**Project-Based Scopes**
For specific, outcome-oriented initiatives like a performance audit, an API design project, or a proof-of-concept build. We'll define the scope, deliverables, and timeline to meet a precise business objective.

### Contact Page (`/contact`)

**Page Headline**
Start a Conversation

**Sub-copy**
Choose the channel that works best for you. I'm ready to discuss your next technical challenge and explore how I can contribute to your success.

**CTA 1 Label**
Ping me on LinkedIn

**CTA 1 Micro-copy**
For professional networking and industry chat.

**CTA 2 Label**
Send me your thoughts via email

**CTA 2 Micro-copy**
For detailed project inquiries and attachments.

**CTA 3 Label**
Book 25 minutes to talk

**CTA 3 Micro-copy**
For a focused, no-obligation discovery call.

**CTA 4 Label**
Ask my AI Concierge

**CTA 4 Micro-copy**
For instant answers to common questions about my work.

### Navigation Labels

**Primary Navigation**
*   Gallery
*   Services
*   About
*   Contact

**Footer Navigation**
*   Testimonials
*   Legal
*   Privacy

### Meta Descriptions

**Home**
Fast Dog Coding delivers principal-level software architecture and development for enterprise systems. Explore showcases of robust, scalable solutions built for impact.

**Gallery**
Explore a curated gallery of enterprise-level software architecture and development projects by Fast Dog Coding, showcasing technical solutions and business impact.

**About**
Meet the architect behind Fast Dog Coding. Learn about the philosophy, the process, and the greyhound that inspired it all.

**Services**
Discover the full range of services, from full-stack architecture to technical leadership, and find the flexible engagement model that fits your project needs.

**Contact**
Start a conversation with Fast Dog Coding. Connect via LinkedIn, email, book a call, or chat with the AI concierge to discuss your next technical challenge.

---

## 5. Open Questions & Conflicts

- **[CONFLICT] Component Naming Mismatch**: The `ExecutiveImpactSummary` component in the Frontend Lead's inventory is referred to as `CuratedExhibitPlaque` in the UI/UX Designer's wireframe specifications. Owner's resolution is required to standardize the naming convention across all documentation.
- **[CONFLICT] GraphQL and Prisma Schema Discrepancy**: The GraphQL `Mutation.updateContent` references a `field` parameter, which is not directly represented in the Prisma schema. Clarification is needed on how this field corresponds to the database schema.
- **[CONFLICT] Missing Copy for `TestimonialDisplay`**: The `TestimonialDisplay` component is listed in the Frontend Lead's inventory but lacks corresponding production copy in the Copywriter's document. Owner's input is needed to provide the necessary content.

### Owner's Resolution

- **ExecutiveImpactSummary vs CuratedExhibitPlaque** — The component is `CuratedExhibitPlaque` (the Charter's term, and the design metaphor). `ExecutiveImpactSummary` is the content type/slot name (what the data is called). They describe two layers of the same thing: the plaque is the container, the executive summary is its content. Both names survive, for different purposes.
- **GraphQL updateContent.field** — This maps to the Prisma field using a `ContentBlock` row approach: `field` is the column name (slug, body, template, etc.) being patched. The mutation is a targeted single-column update: `UPDATE content_blocks SET $field = $content WHERE id = $id`. Perfectly valid.
- **Missing TestimonialDisplay copy** — This is expected: testimonials are sourced content (the LinkedIn recommendations in `config/content/testimonials.md`), not generated copy. The Copywriter doesn't write them — the owner seeds them from the real testimonials.
