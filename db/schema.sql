-- Fast Dog Coding — PostgreSQL DDL
-- Source: Technical Design Spec § 2
--
-- Architecture: M:N reusable sections via page_sections join table.
-- Pages are routing shells. Sections are standalone content atoms.
--
-- This file is a reference artifact. Prisma manages the actual schema via `db push`.
-- Keep this in sync with prisma/schema.prisma as the canonical DDL.

-- Extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- The routing layer: one row per URL
CREATE TABLE pages (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         VARCHAR(255) UNIQUE NOT NULL,
  parent_slug  VARCHAR(255) REFERENCES pages(slug) ON DELETE CASCADE,
  title        VARCHAR(500) NOT NULL,
  meta_desc    TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  is_nav       BOOLEAN NOT NULL DEFAULT false,
  nav_label    VARCHAR(100),
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- The content layer: standalone, reusable content atoms
CREATE TABLE sections (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        VARCHAR(100) UNIQUE,             -- optional: for addressable/reusable sections
  type        VARCHAR(100) NOT NULL,            -- vocabulary term: 'hero', 'prose', 'exhibit', etc.
  data        JSONB NOT NULL DEFAULT '{}',      -- payload; schema defined per-component (Zod)
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- The composition layer: M:N join table mapping sections onto pages
CREATE TABLE page_sections (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id      UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  section_id   UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  display_hint VARCHAR(50),                     -- context-dependent rendering: 'compact', 'card', etc.
  UNIQUE(page_id, section_id)
);

CREATE INDEX idx_pages_slug           ON pages(slug);
CREATE INDEX idx_pages_parent_slug    ON pages(parent_slug);
CREATE INDEX idx_pages_is_nav         ON pages(is_nav) WHERE is_nav = true;
CREATE INDEX idx_sections_type        ON sections(type);
CREATE INDEX idx_page_sections_page   ON page_sections(page_id, sort_order);
