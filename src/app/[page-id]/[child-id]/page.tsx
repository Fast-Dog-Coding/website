/**
 * Universal Child Page Handler
 *
 * Handles nested routes: /gallery/[project], etc.
 * Source: TDS § 1 — "app/[page-id]/[child-id]/page.tsx"
 */

import { gqlFetch } from "@/lib/gql/fetch";
import { PAGE_QUERY } from "@/lib/gql/queries";
import { SectionRenderer } from "@/_components/SectionRenderer";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { PageQueryResponse } from "@/types";

export const revalidate = false;

interface ChildPageProps {
  params: Promise<{ "page-id": string; "child-id": string }>;
}

export async function generateMetadata({
  params,
}: ChildPageProps): Promise<Metadata> {
  const { "page-id": pageId, "child-id": childId } = await params;

  const { page } = await gqlFetch<PageQueryResponse>(PAGE_QUERY, {
    slug: childId,
    parentSlug: pageId,
  });

  if (!page) return {};

  return {
    title: `${page.title} — Fast Dog Coding`,
    description: page.metaDesc,
  };
}

export default async function ChildPage({ params }: ChildPageProps) {
  const { "page-id": pageId, "child-id": childId } = await params;

  const { page } = await gqlFetch<PageQueryResponse>(PAGE_QUERY, {
    slug: childId,
    parentSlug: pageId,
  });

  if (!page || !page.isPublished) notFound();

  return <SectionRenderer sections={page.sections} />;
}
