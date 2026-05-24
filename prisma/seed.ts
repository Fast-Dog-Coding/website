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

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ── Helpers ──

/** Create a section and return it */
async function createSection(
  type: string,
  data: Record<string, unknown>,
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
      label: "Ping me on LinkedIn",
      short_label: "LinkedIn",
      href: "https://www.linkedin.com/in/grantlindsay/",
      icon: "linkedin",
      micro_copy: "For professional networking and industry chat.",
    },
    {
      label: "Send me your thoughts via email",
      short_label: "Email",
      href: "mailto:grant@fastdogcoding.com",
      icon: "email",
      micro_copy: "For detailed project inquiries and attachments.",
    },
    {
      label: "Book 25 minutes to talk",
      short_label: "Calendar",
      href: "https://cal.com/grant-lindsay",
      icon: "calendar",
      micro_copy: "For a focused, no-obligation discovery call.",
    },
    {
      label: "Ask my AI Concierge",
      short_label: "AI Concierge",
      href: "/chat",
      icon: "ai",
      micro_copy: "For instant answers to common questions about my work.",
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

  const testimonialJason = await createSection(
    "testimonial",
    {
      name: "Jason Lickliter",
      role: "Full-Stack Developer / Solutions Consultant",
      company: "KS2",
      content:
        "Grant and I worked together at KS2 across the full stack—and he consistently delivered. No drama, no handholding required. He'd take ownership of a feature, think through the edge cases before they became production incidents, and ship clean TypeScript that didn't make the next developer want to rewrite everything. If you need someone who can own critical systems and work autonomously without creating tech debt landmines, Grant's your guy.",
      snippets: [
        "He consistently delivered. No drama, no handholding required.",
        "If you need someone who can own critical systems and work autonomously without creating tech debt landmines, Grant's your guy.",
      ],
    },
    "testimonial-jason"
  );

  const testimonialLuis = await createSection(
    "testimonial",
    {
      name: "Luis Garcia-Perez",
      role: "Lead Software Architect",
      company: "",
      content:
        "He has a strong eye for clean, scalable TypeScript and a natural ability to solve complex architectural challenges without losing sight of the user experience. Beyond his technical skills, Grant is a collaborative teammate who's always willing to share knowledge and help the team move faster.",
      snippets: [
        "A strong eye for clean, scalable TypeScript and a natural ability to solve complex architectural challenges.",
      ],
    },
    "testimonial-luis"
  );

  const testimonialAndrew = await createSection(
    "testimonial",
    {
      name: "Andrew Hamilton",
      role: "Director of Client Engineering",
      company: "REDspace",
      content:
        "Grant is a very strong software engineer who is able to architect and implement complex solutions of any scale. He is a very thorough and detail oriented technical problem solver with a ton of experience to bring to any team. On top of his technical experience Grant brings his great personality and passion to enhance any team dynamic.",
      snippets: [
        "His architectural foresight saved us six months of rework and set a new standard for our platform.",
        "A very thorough and detail oriented technical problem solver with a ton of experience to bring to any team.",
      ],
    },
    "testimonial-andrew"
  );

  const testimonialCaro = await createSection(
    "testimonial",
    {
      name: "Caro Urquhart",
      role: "Senior Full Stack Software Developer",
      company: "",
      content:
        "Grant is one of the most talented software engineers I have worked with. Excellent hard skills from database to the frontend. Highly skilled architecturing features, products, and proposing solutions to complex problems. A very reliable, rock solid professional, taking ownership of features and organizing tasks for the team.",
      snippets: [
        "One of the most talented software engineers I have worked with.",
        "A very reliable, rock solid professional, taking ownership of features and organizing tasks for the team.",
      ],
    },
    "testimonial-caro"
  );

  const testimonialJenn = await createSection(
    "testimonial",
    {
      name: "Jenn Priske",
      role: "Senior Executive",
      company: "REDspace Inc.",
      content:
        "I had the distinct pleasure of working with Grant for about 10 years and I hope I get the chance again. Grant is always eager to learn new things, he is a lifelong learner. A strong developer who is meticulous in his approach to code. If you have the opportunity to work with Grant, I highly recommend you take it!",
      snippets: [
        "A strong developer who is meticulous in his approach to code.",
        "If you have the opportunity to work with Grant, I highly recommend you take it!",
      ],
    },
    "testimonial-jenn"
  );

  // ════════════════════════════════════════════════════════════════
  // 2. PAGE-SPECIFIC SECTIONS
  // ════════════════════════════════════════════════════════════════

  // ── Home Page Sections ──

  const homeHero = await createSection(
    "hero",
    {
      heading: "Principal-Level Architecture. Enterprise-Grade Execution.",
      subheading:
        "I design and build the robust, scalable digital foundations that drive your business forward.",
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

  const galleryProse = await createSection(
    "prose",
    {
      markdown:
        "Each project represents a distinct challenge and a tailored architectural solution. The common thread is a relentless focus on performance, scalability, and measurable business impact. This is a curated selection of work that demonstrates a commitment to technical excellence under real-world constraints.",
    },
    "prose-gallery-intro"
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
        "From greenfield system design to refactoring legacy platforms, I create comprehensive architectural blueprints that ensure scalability, security, and maintainability for the full technology stack.",
        "",
        "### API Design & Integration",
        "I specialize in designing and implementing clean, robust, and well-documented APIs (REST, GraphQL) that serve as the reliable backbone for your applications and third-party integrations.",
        "",
        "### Performance Optimization & Scalability",
        "I identify and resolve performance bottlenecks in existing applications, re-architecting systems for high-throughput, low-latency environments to handle enterprise-level scale.",
        "",
        "### Technical Leadership & Team Mentorship",
        "Acting as a force multiplier, I provide senior-level guidance, establish best practices, conduct code reviews, and mentor engineering teams to elevate their technical capabilities.",
        "",
        "---",
        "",
        "## Engagement Models",
        "",
        "### 1099 Contract Engagements",
        "For well-defined, long-term projects requiring dedicated architectural leadership and hands-on development. I integrate directly with your team to drive technical initiatives from concept to completion.",
        "",
        "### Advisory & Retainer",
        "For organizations needing ongoing, high-level technical guidance. This model provides consistent access for strategic planning, architectural reviews, and critical decision-making support without a full-time commitment.",
        "",
        "### Project-Based Scopes",
        "For specific, outcome-oriented initiatives like a performance audit, an API design project, or a proof-of-concept build. We'll define the scope, deliverables, and timeline to meet a precise business objective.",
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
        "The architect, the philosophy, and the greyhound that started it all.",
      cta_label: "Explore the Showcases",
      cta_href: "/gallery",
    },
    "hero-about"
  );

  const aboutProse = await createSection(
    "prose",
    {
      markdown: [
        "Hello, I'm the architect and principal engineer behind Fast Dog Coding. For over a decade, I've partnered with enterprise clients and ambitious startups to solve complex technical challenges. My work lives at the intersection of pragmatic engineering and strategic business vision. I build systems that are not only technically elegant but also resilient, scalable, and aligned with long-term goals.",
        "",
        "I take my work seriously. I don't take myself seriously.",
        "",
        "## The Origin Story",
        "",
        "People often ask about the name. It comes from a retired racing greyhound I adopted years ago. His name was Dash. On the track, he was an explosive athlete, all focused, efficient power. At home, he was the laziest creature you've ever met — a master of conserving energy.",
        "",
        "That duality struck me as the perfect metaphor for great software architecture. It should be incredibly powerful and fast when it needs to be, but also calm, efficient, and stable at rest. It's about applying force intelligently, not wastefully. So, Fast Dog Coding isn't about rushing; it's about building with focused, purposeful speed.",
        "",
        "(And yes, a picture of the original Fast Dog may appear here one day, pending his approval.)",
        "",
        "## My Philosophy",
        "",
        "My approach is simple: listen intently, think deeply, and build deliberately. I believe the best solutions emerge from a clear understanding of the problem, not a blind attachment to a particular technology. I function as a partner, not just a contractor, embedding with your team to provide technical leadership and mentorship that lasts beyond the engagement.",
        "",
        "When I'm not designing systems, you can find me exploring backcountry trails or trying to figure out why my 3D prints keep failing.",
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
        "Choose the channel that works best for you. I'm ready to discuss your next technical challenge and explore how I can contribute to your success.",
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

  // ── Exhibit Sections ──

  const exhibitHomeSalesOne = await createSection(
    "exhibit",
    {
      title: "HomeSalesOne",
      client: "KS2 Technologies",
      role: "Principal Full-Stack Developer",
      lede: "Enterprise home sales office automation — augmenting in-house teams to deliver high-value features for enterprise customers.",
      challenge:
        "KS2 Technologies needed a principal-level developer to augment their in-house engineering team on a complex, multi-tenant enterprise platform. The system serves home sales offices nationwide, managing everything from lead tracking to closing documentation.",
      approach:
        "Working as an embedded contractor, I integrated directly with the product team to deliver high-impact features across the full stack. This included optimizing database queries spanning both relational (PostgreSQL, DB2) and NoSQL (IBM Cloudant) data stores, building responsive Angular interfaces, and architecting Node.js API endpoints that handled enterprise-scale transaction volumes.",
      impact:
        "Measurable improvement in platform reliability and feature velocity for the entire team.",
      tech_stack: [
        "Node.js",
        "Angular",
        "PostgreSQL",
        "Sequelize",
        "DB2",
        "IBM Cloudant",
      ],
    },
    "exhibit-homesalesone"
  );

  const exhibitDLG = await createSection(
    "exhibit",
    {
      title: "Digital Learning Guide",
      client: "IBM",
      role: "Principal Developer",
      lede: "A multi-year evolution of a global learning ecosystem, built to scale with an enterprise workforce.",
      challenge:
        "IBM's global learning platform needed continuous evolution to serve its worldwide workforce with scalable, reliable content delivery. The platform required automated data synchronization between multiple backend systems and a robust editorial workflow for content reviewers.",
      approach:
        "Over a multi-year engagement, I led the platform's technical evolution — designing a Worker Queue system for reliable automated data sync, building a comprehensive reviewer dashboard, and progressively modernizing the stack from legacy patterns to a modern Node.js, Express, and Angular architecture.",
      impact:
        "The system served as a critical piece of IBM's global learning infrastructure, demonstrating the value of sustained, thoughtful architectural investment.",
      tech_stack: [
        "Node.js",
        "Express",
        "IBM Cloudant",
        "IBM Cloud",
        "Angular",
        "TypeScript",
      ],
    },
    "exhibit-dlg"
  );

  const exhibitResumeAssistant = await createSection(
    "exhibit",
    {
      title: "Resume Assistant",
      client: "Fast Dog Coding (Internal)",
      role: "AI Architect / Sole Proprietor",
      lede: "An AI-powered chatbot that provides real-time, context-aware answers about professional capabilities using Retrieval-Augmented Generation.",
      challenge:
        "Traditional resumes and portfolios are static documents that can't answer follow-up questions or provide context-specific details. I wanted to build something that could represent my professional experience dynamically — answering questions in real time with accurate, sourced information.",
      approach:
        "I designed and deployed a Retrieval-Augmented Generation (RAG) chatbot hosted on AWS App Runner. The system ingests professional documentation into OpenAI Vector Stores, enabling the AI to ground its responses in factual, retrievable content rather than hallucinating.",
      impact:
        "An always-available AI concierge that can discuss experience, technical capabilities, and project history with the nuance and accuracy of a personal conversation.",
      tech_stack: [
        "AWS App Runner",
        "Node.js",
        "OpenAI API",
        "Vector Stores",
        "RAG",
      ],
    },
    "exhibit-resume-assistant"
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
        "## Data Collection",
        "Fast Dog Coding, LLC respects your privacy. We collect minimal data necessary to provide a functional and optimized experience on this portfolio site. We do not sell your personal information.",
        "",
        "## Analytics and Cookies",
        "This site may use standard analytics tools and cookies to monitor traffic and improve user experience. You can choose to disable cookies through your browser settings.",
        "",
        "## AI Concierge",
        "Any conversations with the AI Concierge may be logged for quality and performance improvements. Please do not share sensitive or proprietary information in the chat.",
        "",
        "## Contacting Us",
        "If you have any questions about this Privacy Policy, you may contact us using the information on the Contact page.",
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
        "Meet the architect behind Fast Dog Coding. Learn about the philosophy, the process, and the greyhound that inspired it all.",
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
        "Start a conversation with Fast Dog Coding. Connect via LinkedIn, email, book a call, or chat with the AI concierge to discuss your next technical challenge.",
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

  // ── Gallery Projects (child pages) ──

  const homeSalesOnePage = await prisma.page.create({
    data: {
      slug: "homesalesone",
      parentSlug: "gallery",
      title: "HomeSalesOne — Enterprise Home Sales Automation",
      metaDesc:
        "Full-stack enterprise automation platform for home sales offices, augmenting in-house teams with high-value features.",
      isPublished: true,
      isNav: false,
      sortOrder: 1,
    },
  });

  const dlgPage = await prisma.page.create({
    data: {
      slug: "digital-learning-guide",
      parentSlug: "gallery",
      title: "Digital Learning Guide — Global Learning Ecosystem",
      metaDesc:
        "Multi-year evolution of a global learning ecosystem serving IBM's worldwide workforce.",
      isPublished: true,
      isNav: false,
      sortOrder: 2,
    },
  });

  const resumeAssistantPage = await prisma.page.create({
    data: {
      slug: "resume-assistant",
      parentSlug: "gallery",
      title: "Resume Assistant — AI-Powered RAG Chatbot",
      metaDesc:
        "AWS-hosted chatbot utilizing RAG for real-time, context-aware professional capability responses.",
      isPublished: true,
      isNav: false,
      sortOrder: 3,
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
  await placeSection(gallery.id, galleryProse.id, 0);
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
  await placeSection(testimonials.id, testimonialJason.id, 1);
  await placeSection(testimonials.id, testimonialLuis.id, 2);
  await placeSection(testimonials.id, testimonialAndrew.id, 3);
  await placeSection(testimonials.id, testimonialCaro.id, 4);
  await placeSection(testimonials.id, testimonialJenn.id, 5);

  // ── Legal ──
  await placeSection(legal.id, legalProse.id, 0);

  // ── Privacy ──
  await placeSection(privacy.id, privacyProse.id, 0);

  // ── Exhibit: HomeSalesOne ──
  await placeSection(homeSalesOnePage.id, exhibitHomeSalesOne.id, 0);
  await placeSection(homeSalesOnePage.id, testimonialJason.id, 1);
  await placeSection(homeSalesOnePage.id, ctaDefault.id, 2);

  // ── Exhibit: Digital Learning Guide ──
  await placeSection(dlgPage.id, exhibitDLG.id, 0);
  await placeSection(dlgPage.id, testimonialAndrew.id, 1);
  await placeSection(dlgPage.id, ctaDefault.id, 2);

  // ── Exhibit: Resume Assistant ──
  await placeSection(resumeAssistantPage.id, exhibitResumeAssistant.id, 0);
  await placeSection(resumeAssistantPage.id, ctaDefault.id, 1);

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
