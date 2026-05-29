/**
 * Database Seed — Production Content
 * Source: Technical Design Spec § 4
 *
 * Architecture: M:N reusable sections via page_sections join table.
 *
 * Strategy:
 *   1. Create reusable sections first (CTA, testimonials)
 *   2. Create page-specific sections (heroes, prose, exhibits)
 *   3. Create pages (routing shells)
 *   4. Wire them together via page_sections
 *
 * Run with: npx prisma db seed
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { EXHIBITS, TESTIMONIALS } from "./seed-content";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ── Helpers ──

/** Create a section and return it */
async function createSection(
  type: string,
  data: any,
  slug?: string
) {
  return prisma.section.create({
    data: { type, data, slug: slug ?? null },
  });
}

/** Wire a section onto a page at a given position */
async function placeSection(
  pageId: string,
  sectionId: string,
  sortOrder: number,
  displayHint?: string
) {
  return prisma.pageSection.create({
    data: {
      pageId,
      sectionId,
      sortOrder,
      displayHint: displayHint ?? null,
    },
  });
}

async function main() {
  console.log("🌱 Seeding database...");

  // ── Clear existing data (idempotent re-seed) ──
  await prisma.pageSection.deleteMany();
  await prisma.section.deleteMany();
  await prisma.page.deleteMany();

  // ════════════════════════════════════════════════════════════════
  // 1. REUSABLE SECTIONS (shared across multiple pages)
  // ════════════════════════════════════════════════════════════════

  // ── Contact Channels Configuration ──
  const CONTACT_CHANNELS = [
    {
      label: "Ping Grant on LinkedIn",
      short_label: "LinkedIn",
      href: "https://www.linkedin.com/in/grant-lindsay-us/",
      icon: "linkedin",
      micro_copy: "For professional networking and industry chat.",
    },
    {
      label: "Send us your thoughts via email",
      short_label: "Email",
      href: "mailto:info@fastdogcoding.com",
      icon: "email",
      micro_copy: "For detailed project inquiries and attachments.",
    },
    {
      label: "Book 25 minutes to talk",
      short_label: "Calendar",
      href: "https://cal.com/grant-lindsay-7wiujq/25min",
      icon: "calendar",
      micro_copy: "For a focused, no-obligation discovery call.",
    },
    {
      label: "Ask our Candidate Concierge",
      short_label: "Candidate Concierge",
      href: "https://candidate-concierge.fastdogcoding.com/",
      icon: "ai",
      micro_copy: "For instant answers to questions about Grant's work.",
    },
  ];

  const ctaDefault = await createSection(
    "cta",
    {
      heading: "Let's Connect",
      subheading: "Choose the channel that works best for you.",
      channels: CONTACT_CHANNELS,
    },
    "cta-default"
  );

  const ctaContact = await createSection(
    "cta",
    {
      heading: "Get in Touch",
      subheading: "Pick the method that suits you best.",
      channels: CONTACT_CHANNELS,
    },
    "cta-contact"
  );

  // ── Testimonials (standalone, reusable) ──

  const testimonialBySlug = new Map<
    string,
    Awaited<ReturnType<typeof createSection>>
  >();
  for (const { slug, data } of TESTIMONIALS) {
    const section = await createSection("testimonial", data, slug);
    testimonialBySlug.set(slug, section);
  }
  const testimonialAndrew = testimonialBySlug.get("testimonial-andrew")!;

  // ════════════════════════════════════════════════════════════════
  // 2. PAGE-SPECIFIC SECTIONS
  // ════════════════════════════════════════════════════════════════

  // ── Home Page Sections ──

  const homeHero = await createSection(
    "hero",
    {
      heading: "Principal-Level Architecture. Enterprise-Grade Execution.",
      subheading:
        "We design and build the robust, scalable digital foundations that drive your business forward.",
      cta_label: "Explore the Showcases",
      cta_href: "/gallery",
    },
    "hero-home"
  );

  const homeGalleryGrid = await createSection(
    "gallery_grid",
    {
      parent_slug: "gallery",
      featured_limit: 3,
    },
    "gallery-grid-home"
  );

  // ── Gallery Page Sections ──

  const galleryHero = await createSection(
    "hero",
    {
      heading: "Exhibit Gallery",
      subheading:
        "Each project represents a distinct challenge and a tailored architectural solution. The common thread is a relentless focus on performance, scalability, and measurable business impact. This is a curated selection of work that demonstrates a commitment to technical excellence under real-world constraints.",
    },
    "hero-gallery"
  );

  const galleryGrid = await createSection(
    "gallery_grid",
    {
      parent_slug: "gallery",
    },
    "gallery-grid-full"
  );

  // ── Services Page Sections ──

  const servicesHero = await createSection(
    "hero",
    {
      heading: "Capabilities & Engagements",
      subheading:
        "From full-stack architecture to technical leadership — find the engagement model that fits your project.",
      cta_label: "Start a Conversation",
      cta_href: "/contact",
    },
    "hero-services"
  );

  const servicesProse = await createSection(
    "prose",
    {
      markdown: [
        "## Core Capabilities",
        "",
        "### Full-Stack Architecture & Design",
        "From greenfield system design to refactoring legacy platforms, we create comprehensive architectural blueprints that ensure scalability, security, and maintainability for the full technology stack.",
        "",
        "### API Design & Integration",
        "We specialize in designing and implementing clean, robust, and well-documented APIs (REST, GraphQL) that serve as the reliable backbone for your applications and third-party integrations.",
        "",
        "### Performance Optimization & Scalability",
        "We identify and resolve performance bottlenecks in existing applications, re-architecting systems for high-throughput, low-latency environments to handle enterprise-level scale.",
        "",
        "### Technical Leadership & Team Mentorship",
        "Acting as a force multiplier, we provide senior-level guidance, establish best practices, conduct code reviews, and mentor engineering teams to elevate their technical capabilities.",
        "",
        "---",
        "",
        "## Engagement Models",
        "",
        "### Contract Engagements",
        "For well-defined, long-term projects requiring dedicated architectural leadership and hands-on development. We integrate directly with your team to drive technical initiatives from concept to completion.",
        "",
        "### Advisory & Retainer",
        "Think, fractional. For organizations needing ongoing, high-level technical guidance. This model provides consistent access for strategic planning, architectural reviews, and critical decision-making support without a full-time commitment.",
        "",
        "### Project-Based Scopes",
        "For specific, outcome-oriented initiatives like a performance audit, an API design project, or a proof-of-concept build. We'll define the scope, deliverables, and timeline to meet a precise business objective.",
        "",
        "### Full-Time Employment",
        "While Fast Dog Coding operates primarily as a consultancy, we are occasionally open to direct-hire technical leadership roles. These are reserved for exceptional, remote-only opportunities—a 'unicorn' alignment of a compelling mission, great people, and a strong engineering culture.",
      ].join("\n"),
    },
    "prose-services"
  );

  // ── About Page Sections ──

  const aboutHero = await createSection(
    "hero",
    {
      heading: "About",
      subheading:
        "The architect, the philosophy, and the greyhounds that started it all.",
      cta_label: "Explore the Showcases",
      cta_href: "/gallery",
    },
    "hero-about"
  );

  const aboutProse = await createSection(
    "prose",
    {
      markdown: [
        "Hello, I'm Grant Lindsay, the Principal Software Architect and founder of Fast Dog Coding. For over 15 years, I've partnered with global enterprises and ambitious startups to solve high-stakes technical challenges—specializing in cloud migrations, legacy modernization, and AI-driven automation. I build technical solutions that solve real business problems. My focus is on engineering systems that are resilient, scalable, and simple for teams to maintain.",
        "",
        "I take my work seriously. I don't take myself seriously.",
        "",
        "## The Origin Story",
        "",
        "People often ask about the name. It wasn't born in a marketing brainstorm; it was born out of international legal compliance.",
        "",
        "In 2014, I landed a major engagement with a fantastic Canadian firm. Because I am a U.S. resident, cross-border regulations meant they couldn't hire me as a traditional employee. To make the partnership work, I needed to stand up an LLC, and I needed a name fast.",
        "",
        "At the time, my wife and I had adopted three retired racing greyhounds: Rio, Wavorly, and Oriole. I wanted the company name to honor them, but using the word 'Greyhound' felt like an open invitation for a confusing legal battle with a certain bus line ('No, ma'am, I can't book you a ticket to Cleveland, I'm an application developer'). ",
        "",
        "'Fast Dog Coding' made the shortlist, the LLC registration was clear, and a business was born.",
        "",
        "While the legal origin is purely practical, the metaphor remains perfect. Greyhounds are famous for a unique dichotomy: they are explosive, powerful athletes on the track, but absolute couch potatoes at home who master the art of conserving energy. ",
        "",
        "Great software architecture should behave exactly the same way. The end-user application should be incredibly fast and explosive when handling peak enterprise loads, but the experience of maintaining and evolving the code should be calm, low-stress, and blissfully uneventful. It’s about applying computational force intelligently on the track, so your team can conserve its energy at rest. ",
        "",
        "## My Philosophy",
        "",
        "My approach is simple: listen carefully, think deeply, and build deliberately. I believe the best solutions emerge from a clear understanding of the business problem, not a blind attachment to a trendy framework. I function as a true partner, embedding with teams to provide technical leadership and mentorship that elevates everyone involved.",
        "",
        "When I'm not 'swapping engines mid-flight' on legacy servers, you can usually find me walking to clear my mind, playing low-stress video games, or traveling to discover local foods and meet new people. ",
        "",
        "I also have a deep fascination with languages. I can understand French (si vous parlez plus lentement) and am currently tackling the structural challenge of learning Japanese.",
        "",
        "Speaking of which, why do programmers prefer dark mode?",
        "",
        "Because light attracts bugs.",
      ].join("\n"),
    },
    "prose-about"
  );

  // ── Contact Page Sections ──

  const contactHero = await createSection(
    "hero",
    {
      heading: "Start a Conversation",
      subheading:
        "Choose the channel that works best for you. We're ready to discuss your next technical challenge and explore how we can contribute to your success.",
    },
    "hero-contact"
  );

  // ── Testimonials Page Sections ──

  const testimonialsHero = await createSection(
    "hero",
    {
      heading: "Testimonials",
      subheading: "What clients and colleagues have to say.",
    },
    "hero-testimonials"
  );

  // ── Legal & Privacy Prose ──

  const legalProse = await createSection(
    "prose",
    {
      markdown: [
        "# Legal Information",
        "",
        "## Terms of Use",
        'This website is operated by Fast Dog Coding, LLC. The content on this website is provided for informational and demonstrative purposes only.',
        "",
        "## Disclaimer",
        'The materials on this website are provided "as is". Fast Dog Coding, LLC makes no warranties, expressed or implied, and hereby disclaims all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.',
        "",
        "## Intellectual Property",
        "Unless otherwise noted, all content, design, and intellectual property on this site is owned by Fast Dog Coding, LLC. You may not reproduce or use this content without explicit permission.",
      ].join("\n"),
    },
    "prose-legal"
  );

  const privacyProse = await createSection(
    "prose",
    {
      markdown: [
        "# Privacy Policy",
        "",
        "*Last updated: May 28, 2026*",
        "",
        "## Data Collection",
        "",
        "Fast Dog Coding, LLC respects your privacy. This portfolio site does not use contact forms or account registration. We do not sell your personal information.",
        "",
        "## Server Logs",
        "",
        "Our hosting provider maintains standard web server logs (such as IP address, browser type, and pages requested) to operate and secure the site. We do not use analytics tools or cookies on this website.",
        "",
        "## Candidate Concierge",
        "",
        "The [Candidate Concierge](https://candidate-concierge.fastdogcoding.com/) chat (linked from our Contact page) is a separate service. How it collects, uses, and retains information is described in the [Candidate Concierge Privacy Policy](https://candidate-concierge.fastdogcoding.com/privacy). This portfolio site does not process Concierge chat data.",
        "",
        "## Third-Party Services",
        "",
        "Links on this site (for example, scheduling, email, LinkedIn, or the Candidate Concierge) are operated by third parties with their own privacy practices.",
        "",
        "## Contacting Us",
        "",
        "If you have questions about this Privacy Policy, contact us using the information on [the Contact page](/contact).",
      ].join("\n"),
    },
    "prose-privacy"
  );

  // ════════════════════════════════════════════════════════════════
  // 3. PAGES (routing shells only)
  // ════════════════════════════════════════════════════════════════

  const home = await prisma.page.create({
    data: {
      slug: "home",
      title: "Fast Dog Coding — Principal-Level Architecture",
      metaDesc:
        "Fast Dog Coding delivers principal-level software architecture and development for enterprise systems. Explore showcases of robust, scalable solutions built for impact.",
      isPublished: true,
      isNav: false,
      sortOrder: 0,
    },
  });

  const gallery = await prisma.page.create({
    data: {
      slug: "gallery",
      title: "Showcases",
      metaDesc:
        "Explore a curated gallery of enterprise-level software architecture and development projects by Fast Dog Coding, showcasing technical solutions and business impact.",
      isPublished: true,
      isNav: true,
      navLabel: "Gallery",
      sortOrder: 1,
    },
  });

  const services = await prisma.page.create({
    data: {
      slug: "services",
      title: "Capabilities & Engagements",
      metaDesc:
        "Discover the full range of services, from full-stack architecture to technical leadership, and find the flexible engagement model that fits your project needs.",
      isPublished: true,
      isNav: true,
      navLabel: "Services",
      sortOrder: 2,
    },
  });

  const about = await prisma.page.create({
    data: {
      slug: "about",
      title: "About",
      metaDesc:
        "Meet the architect behind Fast Dog Coding. Learn about the philosophy, the process, and the greyhounds that inspired it all.",
      isPublished: true,
      isNav: true,
      navLabel: "About",
      sortOrder: 3,
    },
  });

  const contact = await prisma.page.create({
    data: {
      slug: "contact",
      title: "Start a Conversation",
      metaDesc:
        "Start a conversation with Fast Dog Coding. Connect via LinkedIn, email, book a call, or chat with the Candidate Concierge to discuss your next technical challenge.",
      isPublished: true,
      isNav: true,
      navLabel: "Contact",
      sortOrder: 4,
    },
  });

  const testimonials = await prisma.page.create({
    data: {
      slug: "testimonials",
      title: "Testimonials",
      metaDesc:
        "What clients and colleagues say about working with Fast Dog Coding.",
      isPublished: true,
      isNav: false,
      sortOrder: 0,
    },
  });

  const legal = await prisma.page.create({
    data: {
      slug: "legal",
      title: "Legal Information",
      metaDesc: "Legal information and terms of use for Fast Dog Coding.",
      isPublished: true,
      isNav: false,
      sortOrder: 0,
    },
  });

  const privacy = await prisma.page.create({
    data: {
      slug: "privacy",
      title: "Privacy Policy",
      metaDesc: "Privacy policy for Fast Dog Coding.",
      isPublished: true,
      isNav: false,
      sortOrder: 0,
    },
  });

  // ════════════════════════════════════════════════════════════════
  // 4. WIRE SECTIONS → PAGES (via page_sections join table)
  // ════════════════════════════════════════════════════════════════

  // ── Home ──
  await placeSection(home.id, homeHero.id, 0);
  await placeSection(home.id, homeGalleryGrid.id, 1);
  await placeSection(home.id, testimonialAndrew.id, 2, "compact");
  await placeSection(home.id, ctaDefault.id, 3);

  // ── Gallery ──
  await placeSection(gallery.id, galleryHero.id, 0);
  await placeSection(gallery.id, galleryGrid.id, 1);

  // ── Services ──
  await placeSection(services.id, servicesHero.id, 0);
  await placeSection(services.id, servicesProse.id, 1);
  await placeSection(services.id, ctaDefault.id, 2);

  // ── About ──
  await placeSection(about.id, aboutHero.id, 0);
  await placeSection(about.id, aboutProse.id, 1);
  await placeSection(about.id, ctaDefault.id, 2);

  // ── Contact ──
  await placeSection(contact.id, contactHero.id, 0);
  await placeSection(contact.id, ctaContact.id, 1);

  // ── Testimonials ──
  await placeSection(testimonials.id, testimonialsHero.id, 0);
  for (let i = 0; i < TESTIMONIALS.length; i++) {
    const section = testimonialBySlug.get(TESTIMONIALS[i].slug)!;
    await placeSection(testimonials.id, section.id, i + 1);
  }

  // ── Legal ──
  await placeSection(legal.id, legalProse.id, 0);

  // ── Privacy ──
  await placeSection(privacy.id, privacyProse.id, 0);

  // ── Gallery exhibit pages ──
  for (const exhibit of EXHIBITS) {
    const exhibitSection = await createSection(
      "exhibit",
      exhibit.data,
      exhibit.exhibitSlug
    );
    const galleryPage = await prisma.page.create({
      data: {
        slug: exhibit.pageSlug,
        parentSlug: "gallery",
        title: exhibit.pageTitle,
        metaDesc: exhibit.metaDesc,
        isPublished: true,
        isNav: false,
        sortOrder: exhibit.sortOrder,
      },
    });
    let placementOrder = 0;
    await placeSection(galleryPage.id, exhibitSection.id, placementOrder++);
    if (exhibit.testimonialSlug) {
      const testimonial = testimonialBySlug.get(exhibit.testimonialSlug);
      if (testimonial) {
        await placeSection(galleryPage.id, testimonial.id, placementOrder++, "compact");
      }
    }
    await placeSection(galleryPage.id, ctaDefault.id, placementOrder);
  }

  // ── Summary ──

  const pageCount = await prisma.page.count();
  const sectionCount = await prisma.section.count();
  const placementCount = await prisma.pageSection.count();
  console.log(
    `✅ Seeded ${pageCount} pages, ${sectionCount} sections, ${placementCount} placements.`
  );

  // ── Reuse report ──
  const ctaPlacements = await prisma.pageSection.count({
    where: { sectionId: ctaDefault.id },
  });
  const testimonialAndrewPlacements = await prisma.pageSection.count({
    where: { sectionId: testimonialAndrew.id },
  });
  console.log(
    `   ↳ cta-default reused on ${ctaPlacements} pages (zero duplication)`
  );
  console.log(
    `   ↳ testimonial-andrew reused on ${testimonialAndrewPlacements} pages`
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
