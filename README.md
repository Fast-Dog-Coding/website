# Fast Dog Coding Website

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

The public portfolio site for [Fast Dog Coding](https://fastdogcoding.com) — a server-driven UI (SDUI) showcase built with Next.js, GraphQL, and Prisma. The site demonstrates principal-level architecture by being one of the projects in its own gallery.

**Live site:** [fastdogcoding.com](https://fastdogcoding.com)  
**Codebase version:** 1.0.0 (Website v2)

## What makes this different

Most portfolio sites are static brochures. This one works like a browser:

- **Vocabulary** — section `type` strings (`hero`, `exhibit`, `testimonial`, …) mapped in `SectionRenderer`
- **Document** — `pages` + ordered `page_sections` rows pointing at reusable `sections`
- **Renderer** — maps each type to a React component without hard-coded routes per page

Add a new page by seeding the database. Add a new section *type* by creating one component and one map entry. Swap the database and you could run a different site from the same codebase.

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS v4 |
| API | GraphQL (Apollo Server 5) — queries only |
| Data | PostgreSQL via Prisma 7 |
| Deploy | Vercel |

## Quick start

**Prerequisites:** Node.js 20+, PostgreSQL

```bash
git clone https://github.com/Fast-Dog-Coding/website.git
cd website
cp .env.example .env
# Edit .env — set DATABASE_URL, REVALIDATION_SECRET, NEXT_PUBLIC_SITE_URL

createdb fdc_website          # if needed
npm install
npx prisma db push
npx prisma db seed
npm run launch                # loads .env, checks DB, starts next dev
```

Open [http://localhost:3000](http://localhost:3000).

### Common scripts

| Command | Purpose |
|---------|---------|
| `npm run launch` | Dev server with environment checks (`scripts/dev.sh`) |
| `npm run dev` | Next.js dev server only |
| `npm run build` | Production build (Vercel: `scripts/vercel-build.sh`) |
| `npm run test` | Vitest in watch mode |
| `npm run test:run` | Vitest single pass (CI) |
| `npm run db:push` | Sync Prisma schema to the database |
| `npm run db:seed` | Re-seed content (idempotent) |

## Project layout

```
src/
├── app/                    # Routes, API (GraphQL, revalidate), SEO
├── _components/
│   ├── SectionRenderer.tsx # SDUI "browser engine"
│   ├── sections/           # Section vocabulary components
│   └── ui/                 # Shared primitives
├── lib/
│   ├── graphql/            # Schema and resolvers
│   └── gql/                # In-process fetch for Server Components
prisma/
├── schema.prisma           # Canonical data model
└── seed.ts                 # Production content
```

## Documentation

| File | Purpose |
|------|---------|
| [CONTEXT.md](./CONTEXT.md) | Architecture handoff — start here for deep context |
| [Technical_Design_Spec.md](./Technical_Design_Spec.md) | Original design blueprint (historical; app has evolved) |
| [TRADEMARK.md](./TRADEMARK.md) | Brand guidelines for forks |
| [AGENTS.md](./AGENTS.md) | Notes for AI coding assistants |

When the TDS and the running app disagree, trust the code and `CONTEXT.md`.

## Testing

Vitest covers GraphQL resolvers and `SectionRenderer` grouping logic. Tests run without a database connection.

```bash
npm run test:run
```

CI runs on every push and pull request. Production Vercel builds also run tests before `next build`.

## Deployment

Pushes to `main` deploy to Vercel automatically. The build script (`scripts/vercel-build.sh`) runs `prisma generate`, `prisma db push`, tests, then `next build`.

Required Vercel environment variables:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL (Neon pooled URL) |
| `DATABASE_URL_UNPOOLED` | Direct URL for `db push` during build |
| `REVALIDATION_SECRET` | Bearer token for on-demand revalidation |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL (`https://fastdogcoding.com`) |

## Forking

This project is [MIT licensed](./LICENSE). You are welcome to fork and adapt it for your own portfolio. Please replace Fast Dog Coding branding and see [TRADEMARK.md](./TRADEMARK.md) for trademark boundaries.

## Author

**Grant Lindsay** — Principal Software Architect, [Fast Dog Coding, LLC](https://fastdogcoding.com)  
[grant@fastdogcoding.com](mailto:grant@fastdogcoding.com)
