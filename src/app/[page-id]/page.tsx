/**
 * Universal Top-Level Page Handler
 *
 * Handles all routes: /gallery, /services, /about, /contact, etc.
 * Source: TDS § 1 — "app/[page-id]/page.tsx"
 */

import { gqlFetch } from "@/lib/gql/fetch";
import { PAGE_QUERY } from "@/lib/gql/queries";
import { SectionRenderer } from "@/_components/SectionRenderer";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { PageQueryResponse } from "@/types";

export const revalidate = false;

interface PageProps {
  params: Promise<{ "page-id": string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { "page-id": pageId } = await params;

  const { page } = await gqlFetch<PageQueryResponse>(PAGE_QUERY, {
    slug: pageId,
  });

  if (!page) return {};

  return {
    title: `${page.title} — Fast Dog Coding`,
    description: page.metaDesc,
  };
}

export default async function TopLevelPage({ params }: PageProps) {
  const { "page-id": pageId } = await params;

  const { page } = await gqlFetch<PageQueryResponse>(PAGE_QUERY, {
    slug: pageId,
  });

  if (!page || !page.isPublished) notFound();

  return <SectionRenderer sections={page.sections} />;
}
