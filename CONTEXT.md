# CONTEXT.md — Fast Dog Coding Website
## Antigravity Handoff Document

> **Purpose:** Read this file at the start of every new conversation in this project.
> It contains the full architectural context, key decisions, and current implementation
> status so work can resume instantly without re-explaining the background.

---

## What This Project Is

The **Fast Dog Coding website** (`fastdogcoding.com`) — a portfolio/showcase site for
Grant Lindsay, an independent Principal Software Architect. The site's purpose is to
secure remote 1099 contracts by demonstrating architectural capability. It is itself
a proof of that capability.

- **Not** a standard portfolio or brochure site
- **Yes** an interactive demonstration of the exact stack it is built on
- The recursive twist: the site is one of the projects in its own gallery

**Target audience:** 45% Enterprise 1099 evaluators, 45% Product/Tool evaluators, 10% W2 hiring managers.

---

## How We Got Here

This project went through a two-phase AI pipeline in `brain-storm/` before any code was written:

1. **Charter Crew** (`brain_storm_crew.py`) — A multi-agent CrewAI brainstorming pipeline
   that debated brand, architecture, and UX, then synthesized a Project Charter.
   Output: `brain-storm/results_20260519_161739/Fast_Dog_Project_Charter.md`

2. **Design Crew** (`design_crew.py`) — A second pipeline that took the approved charter
   and produced domain-specific blueprints (frontend, backend, design system, copy).
   Output: `brain-storm/design_20260520_111108/Technical_Design_Spec.md`

The **Technical Design Specification (TDS)** is the historical design blueprint (copy,
wireframes, brand tokens). **`Technical_Design_Spec.md`** in this repo is a copy of that document.

**Important:** The running app has evolved past the original TDS in a few deliberate ways
(see [TDS vs Implementation](#tds-vs-implementation) below). When in doubt, trust the code
and this file over older TDS section-type names.

---

## Architecture: Server-Driven UI (SDUI)

This is the most important concept to understand before writing any code.

### The Browser Analogy

The app works like an HTML browser. The browser knows a fixed vocabulary of tags
(`<h1>`, `<p>`, `<section>`, etc.) and how to render each one. The HTML author
composes documents from that vocabulary without touching the browser's source code.

This app works the same way:
- **Vocabulary** = section `type` strings mapped in `SectionRenderer.tsx` (e.g. `hero`, `prose`, `exhibit`)
- **Document** = a `pages` row plus ordered `page_sections` rows pointing at reusable `sections` rows
- **Renderer** = `SectionRenderer.tsx`, which maps `section.type → React component`

### What this means in practice

- **Adding a new page** = insert a `pages` row, create or reuse `sections` rows, wire them via
  `page_sections` (with `sort_order` and optional `display_hint`). No route or renderer changes.
- **Adding a new section *type*** = create one `.tsx` file in `_components/sections/` + one entry in
  `SectionRenderer.tsx`'s `SECTION_MAP`.
- **Reusing content across pages** = one `sections` row, multiple `page_sections` placements
  (e.g. shared CTA, testimonial snippets on home and project pages).
- **Two different sites from one codebase** = swap the database. The renderer is content-agnostic.

### Where to stop decomposing

`ExhibitSection` (project showcase detail) is a semantic unit — title, plaque, challenge/approach/impact,
and tech stack have fixed meaning and are not decomposed into generic primitives. The rule:
**decompose until the data describes "what," not "how."**

`SectionRenderer` adds one composition rule: consecutive full-mode `testimonial` sections are auto-wrapped
in a responsive grid (testimonials page). Compact testimonials (`displayHint: "compact"`) render inline.

---

## Data Model (three tables)

```
pages          — routing shell: one row per URL (slug + optional parent_slug for nesting)
sections       — standalone content atoms: type + JSONB data (+ optional slug for reuse)
page_sections  — M:N join: which sections appear on which page, in what order, with what hint
```

- **`pages`**: `slug`, `parent_slug` (self-FK), `title`, `meta_desc`, `is_published`, `is_nav`, `nav_label`, `sort_order`. No content columns.
- **`sections`**: `type` (vocabulary term), `data` (JSONB), optional `slug` for addressable/reusable atoms.
- **`page_sections`**: `sort_order`, optional `display_hint` (e.g. `compact` for inline testimonial quotes).

Full DDL: `db/schema.sql` (reference artifact; keep in sync with Prisma).
Prisma schema: `prisma/schema.prisma` (canonical for migrations / `db push`).
Seed data: `prisma/seed.ts` (production copy from TDS § 4, idempotent re-seed).

### Section vocabulary (7 types — as implemented)

| type | Component | `data` keys (summary) |
|---|---|---|
| `hero` | `HeroSection` | `heading`, `subheading?`, `cta_label?`, `cta_href?` |
| `prose` | `ProseSection` | `markdown` |
| `gallery_grid` | `GalleryGrid` | `parent_slug`, `featured_limit?` — server-fetches child pages |
| `exhibit` | `ExhibitSection` | `title`, `client`, `role`, `lede`, `challenge`, `approach`, `impact`, `tech_stack[]` |
| `cta` | `CTASection` | `heading`, `subheading?`, `channels[]{ label, short_label, href, icon, micro_copy }` |
| `testimonial` | `TestimonialSection` | `name`, `role`, `company`, `content`, `snippets[]` — use `display_hint` on join row |
| `stat_bar` | `StatBar` | `stats[]{ label, value }` |

TypeScript shapes for `exhibit` and `testimonial` live in `src/types/index.ts`; other section
components define local interfaces inline.

### Seeded pages (current)

| slug | Route | Nav | Notes |
|---|---|---|---|
| `home` | `/` | — | Via `app/page.tsx` (not `[page-id]`) |
| `gallery` | `/gallery` | yes | Parent for showcase children |
| `services` | `/services` | yes | |
| `about` | `/about` | yes | |
| `contact` | `/contact` | yes | |
| `testimonials` | `/testimonials` | — | Full testimonial grid |
| `legal` | `/legal` | — | Footer link only |
| `privacy` | `/privacy` | — | Footer link only |
| `homesalesone` | `/gallery/homesalesone` | — | Gallery child |
| `digital-learning-guide` | `/gallery/digital-learning-guide` | — | Gallery child |
| `resume-assistant` | `/gallery/resume-assistant` | — | Gallery child |

Run seed: `npx prisma db seed` (configured in `prisma.config.ts`).

---

## TDS vs Implementation

| TDS (original) | Current app |
|---|---|
| Flat `pages` + `sections` with `sort_order` on section | M:N via `page_sections`; sections reusable across pages |
| `curated_exhibit_plaque` + hero + prose on project pages | Single `exhibit` section |
| `pull_quote` + `testimonial_grid` | Single `testimonial` type; `display_hint` for compact vs full |
| Zod per component | TypeScript interfaces only (Zod deferred) |
| GraphQL mutations for editing | Queries only; mutations = Phase 7 |

The TDS remains valuable for copy, design tokens, and wireframes. Schema and component names above
reflect what ships.

---

## Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Frontend | Next.js 16 App Router (TypeScript) | `src/` directory; read `node_modules/next/dist/docs/` for API changes |
| Styling | Tailwind CSS v4 | Theme tokens in `src/app/globals.css` (TDS § 3) |
| API | GraphQL via Apollo Server 5 | `src/app/api/graphql/route.ts` — **queries only** |
| Data fetching | `gqlFetch` + tagged queries | `src/lib/gql/fetch.ts`, `src/lib/gql/queries.ts` |
| ORM | Prisma 7 + `@prisma/adapter-pg` | Models: `Page`, `Section`, `PageSection` |
| Database | PostgreSQL (`fdc_website` locally) | `DATABASE_URL` in `.env`; config in `prisma.config.ts` |
| Markdown | `react-markdown` | Used in `ProseSection`, `ExhibitSection` |
| Validation | TypeScript interfaces | Zod listed in TDS but not yet installed |
| Auth (Phase 7) | next-auth (planned) | Credentials provider, owner-only — not implemented |

### Environment variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (required for Prisma, seed, sitemap) |
| `REVALIDATION_SECRET` | Bearer token for `POST /api/revalidate` |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL for metadata, sitemap, Open Graph (default: `https://fastdogcoding.com`) |

### Local setup

```bash
createdb fdc_website          # if needed
# .env with DATABASE_URL=postgresql://...
npx prisma db push
npx prisma db seed
npm run dev
```

Optional: `postgres-fdc-website` MCP for DB inspection in Cursor.

---

## Directory Structure (as built)

```
src/
├── app/
│   ├── layout.tsx                   # Root shell: SiteHeader + SiteFooter, Geist fonts
│   ├── page.tsx                     # Home: slug='home'
│   ├── loading.tsx, error.tsx
│   ├── robots.ts, sitemap.ts        # SEO (sitemap queries Prisma)
│   ├── [page-id]/
│   │   ├── page.tsx                 # Universal top-level page renderer
│   │   ├── loading.tsx
│   │   └── [child-id]/
│   │       ├── page.tsx             # Gallery project pages (parent_slug set)
│   │       └── loading.tsx
│   └── api/
│       ├── graphql/route.ts
│       └── revalidate/route.ts
│
├── _components/
│   ├── SectionRenderer.tsx
│   ├── SiteHeader.tsx, SiteFooter.tsx, HeaderNav.tsx
│   ├── sections/                    # HeroSection, ProseSection, GalleryGrid, ExhibitSection,
│   │                                # CTASection, TestimonialSection, StatBar
│   └── ui/                          # Button, Card, Tag
│
├── lib/
│   ├── prisma.ts
│   ├── graphql/schema.ts, resolvers.ts
│   └── gql/fetch.ts, queries.ts
│
└── types/index.ts

db/schema.sql
prisma/schema.prisma, seed.ts
prisma.config.ts                     # Prisma 7 datasource + seed command
Technical_Design_Spec.md
```

---

## ISR Strategy

- All page routes: `export const revalidate = false` (static after first build)
- `gqlFetch` uses `next: { revalidate: false }` for the same behavior on GraphQL fetches
- `POST /api/revalidate` with `Authorization: Bearer <REVALIDATION_SECRET>` → `revalidatePath('/', 'layout')`
- Intended as the Phase 7 editor save hook after DB writes

---

## Brand & Design Tokens (from TDS § 3)

- **Mode:** Dark-mode first
- **Palette:** `background: #111111`, `surface: #1A1A1A`, `border: #2D2D2D`, `primary: #F5F5F5`, `secondary: #A3A3A3`, `accent: #BE9541`, `accent-hover: #D1A758`
- **Font:** Geist Sans (primary), Geist Mono (mono) — via `next/font/google`
- **Motion:** Subtle micro-interactions only. No parallax, no hero carousels, no full-page transitions.
- **Dog imagery:** None anywhere on the site except potentially one photo on `/about`.

**External links (MVP):**
- AI Concierge → `https://candidate-concierge.fastdogcoding.com/` (new tab)
- Resume PDF → `https://fastdogcoding.com/files/resume.pdf` (new tab)

---

## Implementation Status

- [x] Project Charter + TDS produced (`brain-storm/`, `Technical_Design_Spec.md`)
- [x] Next.js scaffold (TypeScript, Tailwind v4, App Router, `src/`)
- [x] **Phase 0** — Tailwind theme, path aliases, directory structure
- [x] **Phase 1** — `db/schema.sql`, Prisma schema, singleton, GraphQL server, seed
- [x] **Phase 2** — `SectionRenderer`, UI atoms, universal route files
- [x] **Phase 3** — All 7 section components (evolved vocabulary; see above)
- [x] **Phase 4** — `SiteHeader`, `SiteFooter`, `HeaderNav`
- [x] **Phase 5** — SEO (`generateMetadata`, `robots.ts`, `sitemap.ts`), root metadata
- [x] **Phase 6** — Production content in `prisma/seed.ts` (incl. testimonials, legal, privacy, gallery projects)
- [ ] **Phase 7** — Live editing (deferred): next-auth, GraphQL mutations, edit UI, revalidate on save

**MVP code complete.** Remaining work is operational and optional:

1. **Deploy** — pick host + managed Postgres, set env vars, run `db push` + seed in prod
2. **Domain** — point `fastdogcoding.com` at deployment
3. **Phase 7** — only if in-browser editing is wanted before continuing to seed/SQL edits

---

## Open Questions

- [x] **AI Concierge** — Link out to candidate concierge (see External links).
- [x] **Resume** — Link out to PDF; MongoDB-rendered resume deferred.
- [ ] **Deployment target** — Open (Vercel + Neon/Supabase is a natural fit for Next.js ISR). Affects env and domain config.
- [x] **Project NDA sanitization** — Content task outside the app (edit seed / DB).

---

## Key Files to Read on First Open

1. `CONTEXT.md` — this file (current state)
2. `Technical_Design_Spec.md` — copy, wireframes, design tokens (§ 3–4); schema § 2 is superseded where noted above
3. `prisma/seed.ts` — what content exists and how pages are wired
4. `src/_components/SectionRenderer.tsx` — section vocabulary registry
5. `src/app/` — routing and data-fetch patterns
