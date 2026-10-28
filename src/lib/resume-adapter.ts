/**
 * Website presentation catalog and resume-master → SDUI adapter.
 *
 * resume-master strips exhibitSlug from every projection. Exhibit pages are
 * keyed by project.id. Testimonial companies come from work[].name via workId.
 */

import type {
  ProjectEntry,
  ProjectedResume,
  ReferenceEntry,
  WorkEntry,
} from "@fastdogcoding/resume-master";
import type { ExhibitData, TestimonialData } from "@/types";

export interface ExhibitPresentation {
  projectId: string;
  pageSlug: string;
  exhibitSlug: string;
  sortOrder: number;
  pageTitle: string;
  metaDesc: string;
  testimonialSlug?: string;
}

export interface TestimonialPresentation {
  name: string;
  slug: string;
  sortOrder: number;
  role: string;
}

/**
 * Reverse-chronological / featured order. sortOrder 1–3 stay the home-page
 * featured exhibits. Page titles and descriptions for the original twelve
 * are the website presentation copy previously stored in prisma/seed-content.ts.
 */
export const EXHIBIT_CATALOG: readonly ExhibitPresentation[] = [
  {
    projectId: "portfolio-website",
    pageSlug: "portfolio-website",
    exhibitSlug: "exhibit-portfolio-website",
    sortOrder: 1,
    pageTitle: "Fast Dog Coding Portfolio Website — Server-Driven UI Showcase",
    metaDesc:
      "Server-driven portfolio site demonstrating architectural capability as an interactive proof of the exact stack prospects would hire for.",
  },
  {
    projectId: "candidate-vantage",
    pageSlug: "candidate-vantage",
    exhibitSlug: "exhibit-candidate-vantage",
    sortOrder: 2,
    pageTitle: "Candidate Vantage — AI Job Fit Scoring",
    metaDesc:
      "AI-driven lead scoring that collects job postings and evaluates them on a 1–5 scale with Jev requirement probabilities.",
  },
  {
    projectId: "candidate-concierge",
    pageSlug: "candidate-concierge",
    exhibitSlug: "exhibit-candidate-concierge",
    sortOrder: 3,
    pageTitle: "Candidate Concierge — AI-Powered RAG Chatbot",
    metaDesc:
      "Vercel-hosted chatbot utilizing RAG for real-time, context-aware professional capability responses.",
  },
  {
    projectId: "resume-master",
    pageSlug: "resume-master",
    exhibitSlug: "exhibit-resume-master",
    sortOrder: 4,
    pageTitle: "Resume Master — Fast Dog Coding",
    metaDesc:
      "Case study: A canonical JSON Resume projection service and TypeScript client delivering policy-filtered career data to Fast Dog Coding apps.",
  },
  {
    projectId: "candidate-brief",
    pageSlug: "candidate-brief",
    exhibitSlug: "exhibit-candidate-brief",
    sortOrder: 5,
    pageTitle: "Candidate Brief — Fast Dog Coding",
    metaDesc:
      "Case study: An outbound research and drafting pipeline turning domain search into reviewed LinkedIn posts and articles with Exa, OpenRouter, and Vercel.",
  },
  {
    projectId: "homesalesone",
    pageSlug: "homesalesone",
    exhibitSlug: "exhibit-homesalesone",
    sortOrder: 6,
    pageTitle: "HomeSalesOne — Enterprise Home Sales Automation",
    metaDesc:
      "Full-stack enterprise automation platform for home sales offices, augmenting in-house teams with high-value features.",
    testimonialSlug: "testimonial-jason",
  },
  {
    projectId: "edvisor",
    pageSlug: "edvisor",
    exhibitSlug: "exhibit-edvisor",
    sortOrder: 7,
    pageTitle: "Edvisor — LMS Modernization",
    metaDesc:
      "High-stakes migration of a global LMS serving 80,000 employees from legacy IBM Domino to a modern stack.",
    testimonialSlug: "testimonial-andrew",
  },
  {
    projectId: "cms-storefront-lita",
    pageSlug: "lita",
    exhibitSlug: "exhibit-lita",
    sortOrder: 8,
    pageTitle: "CMS and Storefront — Lydz in the Attic",
    metaDesc:
      "Custom CMS and storefront for a textile creator with advanced filtering, authentication, and image carousel.",
  },
  {
    projectId: "resume-app",
    pageSlug: "resume-app",
    exhibitSlug: "exhibit-resume-app",
    sortOrder: 9,
    pageTitle: "Resume App — Interactive Data-Driven Resume",
    metaDesc:
      "An interactive resume that both tells and shows career history—always current at a single URL and serving as a live skills demonstration.",
  },
  {
    projectId: "digital-learning-guide",
    pageSlug: "digital-learning-guide",
    exhibitSlug: "exhibit-dlg",
    sortOrder: 10,
    pageTitle: "Digital Learning Guide — Global Learning Ecosystem",
    metaDesc:
      "Multi-year evolution of a global learning ecosystem serving IBM's worldwide workforce.",
    testimonialSlug: "testimonial-jenn",
  },
  {
    projectId: "compliance-attender",
    pageSlug: "compliance-attender",
    exhibitSlug: "exhibit-compliance-attender",
    sortOrder: 11,
    pageTitle: "Compliance Attender — Real-Time DLP on Domino",
    metaDesc:
      "C++ server add-in for real-time email interception and data-leakage prevention on IBM Domino.",
  },
  {
    projectId: "phoenix",
    pageSlug: "phoenix",
    exhibitSlug: "exhibit-phoenix",
    sortOrder: 12,
    pageTitle: "Phoenix — Investment Lifecycle Management",
    metaDesc:
      "Venture capital intake and tracking from initial solicitation through follow-on funding with compliance reporting.",
  },
  {
    projectId: "exposure-monitoring",
    pageSlug: "exposure-monitoring",
    exhibitSlug: "exhibit-exposure-monitoring",
    sortOrder: 13,
    pageTitle: "Exposure Monitoring System — Industrial Hygiene",
    metaDesc:
      "Data management for industrial hygienists tracking workforce exposure and OSHA compliance.",
  },
  {
    projectId: "buzzzone",
    pageSlug: "buzzzone",
    exhibitSlug: "exhibit-buzzzone",
    sortOrder: 14,
    pageTitle: "BuzzZone — Bilingual Enterprise Intranet",
    metaDesc:
      "Company-wide bilingual intranet launched in ten weeks for branch employees moving off green-screen terminals.",
  },
];

/** Website section slug, display order, and cleaned role keyed by reference.name. */
export const TESTIMONIAL_CATALOG: readonly TestimonialPresentation[] = [
  {
    name: "Jason Lickliter",
    slug: "testimonial-jason",
    sortOrder: 1,
    role: "Full-Stack Developer / Solutions Consultant",
  },
  {
    name: "Luis Garcia-Perez",
    slug: "testimonial-luis",
    sortOrder: 2,
    role: "Lead Software Architect",
  },
  {
    name: "Andrew Hamilton",
    slug: "testimonial-andrew",
    sortOrder: 3,
    role: "Director of Client Engineering",
  },
  {
    name: "Caro Urquhart",
    slug: "testimonial-caro",
    sortOrder: 4,
    role: "Senior Full-Stack Software Developer",
  },
  {
    name: "Jenn Priske",
    slug: "testimonial-jenn",
    sortOrder: 5,
    role: "Senior Executive",
  },
];

const exhibitByProjectId = new Map(
  EXHIBIT_CATALOG.map((entry) => [entry.projectId, entry])
);

const testimonialByName = new Map(
  TESTIMONIAL_CATALOG.map((entry) => [entry.name, entry])
);

function cleanLabel(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

/**
 * Strip LinkedIn headline noise: an `@ Company` suffix and a `| ...` suffix.
 * Company is whatever followed `@`, itself trimmed of a trailing `| ...`.
 */
export function normalizeReferenceTitle(title: string): {
  role: string;
  company: string;
} {
  let working = title.trim();
  let company = "";

  const atIndex = working.search(/\s@\s*/);
  if (atIndex !== -1) {
    const afterAt = working.slice(atIndex).replace(/^\s@\s*/, "");
    working = working.slice(0, atIndex);
    company = afterAt;
  }

  const rolePipe = working.indexOf("|");
  if (rolePipe !== -1) {
    working = working.slice(0, rolePipe);
  }

  const companyPipe = company.indexOf("|");
  if (companyPipe !== -1) {
    company = company.slice(0, companyPipe);
  }

  return {
    role: cleanLabel(working),
    company: cleanLabel(company),
  };
}

export function projectToExhibitData(project: ProjectEntry): ExhibitData {
  return {
    title: project.name,
    client: project.entity ?? "",
    role: (project.roles ?? []).join(" / "),
    lede: project.description ?? "",
    challenge: project.challenge ?? "",
    approach: project.approach ?? "",
    impact: project.impact ?? "",
    tech_stack: [...(project.keywords ?? [])],
  };
}

export function resolveTestimonialCompany(
  reference: ReferenceEntry,
  work: readonly WorkEntry[] = []
): string {
  if (reference.workId) {
    const match = work.find((entry) => entry.id === reference.workId);
    if (match?.name) return cleanLabel(match.name);
  }
  if (reference.title) {
    return normalizeReferenceTitle(reference.title).company;
  }
  return "";
}

export function resolveTestimonialRole(reference: ReferenceEntry): string {
  const presentation = testimonialByName.get(reference.name);
  if (presentation) return presentation.role;
  if (reference.title) return normalizeReferenceTitle(reference.title).role;
  return "";
}

export function referenceToTestimonialData(
  reference: ReferenceEntry,
  work: readonly WorkEntry[] = []
): TestimonialData {
  return {
    name: reference.name,
    role: resolveTestimonialRole(reference),
    company: resolveTestimonialCompany(reference, work),
    content: reference.reference,
    snippets: [...(reference.snippets ?? [])],
  };
}

export interface MappedExhibit {
  presentation: ExhibitPresentation;
  data: ExhibitData;
}

export interface MappedTestimonial {
  presentation: TestimonialPresentation;
  data: TestimonialData;
}

export function mapExhibits(projection: ProjectedResume): MappedExhibit[] {
  const mapped: MappedExhibit[] = [];
  for (const project of projection.projects ?? []) {
    if (!project?.id) continue;
    const presentation = exhibitByProjectId.get(project.id);
    if (!presentation) continue;
    mapped.push({
      presentation,
      data: projectToExhibitData(project),
    });
  }
  mapped.sort((a, b) => a.presentation.sortOrder - b.presentation.sortOrder);
  return mapped;
}

export function mapTestimonials(
  projection: ProjectedResume
): MappedTestimonial[] {
  const work = projection.work ?? [];
  const mapped: MappedTestimonial[] = [];
  for (const reference of projection.references ?? []) {
    if (!reference?.name) continue;
    const presentation = testimonialByName.get(reference.name);
    if (!presentation) continue;
    mapped.push({
      presentation,
      data: referenceToTestimonialData(reference, work),
    });
  }
  mapped.sort((a, b) => a.presentation.sortOrder - b.presentation.sortOrder);
  return mapped;
}
