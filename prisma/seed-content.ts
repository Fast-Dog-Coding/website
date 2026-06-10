/**
 * Production content for prisma/seed.ts
 * Sourced from MongoDB resume-assistant.knowledge (LinkedIn recommendations + project catalog).
 */

import type { ExhibitData, TestimonialData } from "../src/types";

export type TestimonialSeed = {
  slug: string;
  data: TestimonialData;
};

export type ExhibitSeed = {
  exhibitSlug: string;
  pageSlug: string;
  sortOrder: number;
  pageTitle: string;
  metaDesc: string;
  data: ExhibitData;
  /** Section slug for optional compact/full testimonial on gallery child page */
  testimonialSlug?: string;
};

export const TESTIMONIALS: TestimonialSeed[] = [
  {
    slug: "testimonial-jason",
    data: {
      name: "Jason Lickliter",
      role: "Full-Stack Developer / Solutions Consultant",
      company: "KS2 Technologies, Inc.",
      content:
        "Grant and I worked together at KS2 across the full stack—and he consistently delivered. No drama, no handholding required. He'd take ownership of a feature, think through the edge cases before they became production incidents, and ship clean TypeScript that didn't make the next developer want to rewrite everything.\n\nWhat I appreciated most was his ability to understand the business context, not just the ticket. He asks why before diving into how, which saves everyone time and keeps the architecture from drifting into accidental complexity. His attention to the details of processes and documentation is methodical—the kind where six months later you can actually trace what was built and why.\n\nHe's also one of those developers who makes the team better—generous with context, willing to pair when it makes sense, and actually listens when someone else has a different approach. That matters when you're moving fast on enterprise projects.\n\nIf you need someone who can own critical systems and work autonomously without creating tech debt landmines, Grant's your guy.",
      snippets: [
        "No drama, no handholding required.",
        "If you need someone who can own critical systems and work autonomously without creating tech debt landmines, Grant's your guy.",
      ],
    },
  },
  {
    slug: "testimonial-luis",
    data: {
      name: "Luis Garcia-Perez",
      role: "Lead Software Architect",
      company: "KS2 Technologies, Inc.",
      content:
        "I had the pleasure of working closely with Grant Lindsay at KS2. He was a key part of the team across the full stack - from Angular on the frontend to Node.js and PostgreSQL on the backend - and made a big impact on the project.\n\nHe has a strong eye for clean, scalable TypeScript and a natural ability to solve complex architectural challenges without losing sight of the user experience.\n\nBeyond his technical skills, Grant is a collaborative teammate who's always willing to share knowledge and help the team move faster. I'd highly recommend him to any team looking for a strong developer.",
      snippets: [
        "A strong eye for clean, scalable TypeScript and a natural ability to solve complex architectural challenges without losing sight of the user experience.",
        "A collaborative teammate who's always willing to share knowledge and help the team move faster.",
      ],
    },
  },
  {
    slug: "testimonial-andrew",
    data: {
      name: "Andrew Hamilton",
      role: "Director of Client Engineering",
      company: "REDspace, Inc.",
      content:
        "Grant is a very strong software engineer who is able to architect and implement complex solutions of any scale. In my years of working with him at REDspace he always proved himself to be the backbone of any project he was involved with. Grant is a very thorough and detail oriented technical problem solver with a ton of experience to bring to any team. On top of his technical experience Grant brings his great personality and passion to enhance any team dynamic. He is a great mentor and goes out of his way to assist and help those working around him grow. I highly recommend Grant to anyone looking to build a successful team or project outcome. You can never go wrong having Grant working with you to support your goals and outcomes.",
      snippets: [
        "The backbone of any project he was involved with.",
        "A very thorough and detail oriented technical problem solver with a ton of experience to bring to any team.",
      ],
    },
  },
  {
    slug: "testimonial-caro",
    data: {
      name: "Caro Urquhart",
      role: "Senior Full Stack Software Developer",
      company: "REDspace, Inc.",
      content:
        "Grant is one of the most talented software engineers I have worked with. We have been working together for around 7 years building apps for the IBM DLG ecosystem. Excellent hard skills from database to the frontend. Highly skilled architecturing features, products, and proposing solutions to complex problems.\n\nHe is also an excellent team player, who is really nice at mentoring co-workers in the new tools or frameworks when changes are needed. A very reliable, rock solid professional, taking ownership of features and organizing tasks for the team. Grant also has a gentle, friendly and considerate personality that contributes positively in the work environment.",
      snippets: [
        "One of the most talented software engineers I have worked with.",
        "A very reliable, rock solid professional, taking ownership of features and organizing tasks for the team.",
      ],
    },
  },
  {
    slug: "testimonial-jenn",
    data: {
      name: "Jenn Priske",
      role: "Senior Executive",
      company: "REDspace Inc.",
      content:
        "I had the distinct pleasure of working with Grant for about 10 years and I hope I get the chance again. Grant is always eager to learn new things, he is a lifelong learner. A strong developer who is meticulous in his approach to code. He takes care to understand the business requirements and is curious about possible solution approaches. He is patient and always willing to the take time to share his point of view, but more importantly, to understand the view of others. He feels successful when the team is successful. He takes a customer-focused approach, always ensuring a clear ROI. If you have the opportunity to work with Grant, I highly recommend you take it!",
      snippets: [
        "A strong developer who is meticulous in his approach to code.",
        "If you have the opportunity to work with Grant, I highly recommend you take it!",
      ],
    },
  },
];

export const EXHIBITS: ExhibitSeed[] = [
  {
    exhibitSlug: "exhibit-portfolio-website",
    pageSlug: "portfolio-website",
    sortOrder: 1,
    pageTitle: "Fast Dog Coding Portfolio Website — Server-Driven UI Showcase",
    metaDesc:
      "Server-driven portfolio site demonstrating architectural capability as an interactive proof of the exact stack prospects would hire for.",
    data: {
      title: "Portfolio Website",
      client: "Fast Dog Coding, LLC (Internal)",
      role: "AI Architect / Sole Proprietor",
      lede: "We built this server-driven portfolio site to demonstrate architectural capability while serving as the primary showcase for contract consulting prospects.",
      challenge:
        "Must convince enterprise evaluators of architectural depth—not read like a static brochure—while staying extensible without code changes for every new page or section.",
      approach:
        "We built on Server-Driven UI: PostgreSQL stores pages, reusable sections, and join rows; a GraphQL read API feeds a fixed vocabulary of React section renderers. Next.js 16 App Router, Apollo Server 5, Prisma 7, Tailwind CSS v4.",
      impact:
        "The site is itself proof of the stack—an interactive demonstration of the exact technologies prospects would hire for, with the recursive twist that the site appears in its own project gallery.",
      tech_stack: [
        "Next.js",
        "React",
        "TypeScript",
        "GraphQL",
        "Apollo Server",
        "PostgreSQL",
        "Prisma",
        "Tailwind CSS",
      ],
    },
  },
  {
    exhibitSlug: "exhibit-homesalesone",
    pageSlug: "homesalesone",
    sortOrder: 4,
    pageTitle: "HomeSalesOne — Enterprise Home Sales Automation",
    metaDesc:
      "Full-stack enterprise automation platform for home sales offices, augmenting in-house teams with high-value features.",
    testimonialSlug: "testimonial-jason",
    data: {
      title: "HomeSalesOne",
      client: "KS2 Technologies, Inc.",
      role: "Principal Full-Stack Developer (Contractor)",
      lede: "We helped KS2 revitalize HomeSalesOne—an enterprise sales-office platform already in production—by delivering retention-critical work on the current release while co-building its next generation on a new stack and hosting platform.",
      challenge:
        "When Fast Dog Coding joined KS2, HomeSalesOne was a mature production platform regional homebuilders relied on every day—with executive sponsorship to evolve it, not just maintain it.",
      approach:
        "We worked on two parallel tracks: shipping selective, high-value features on the production stack—Angular, Node.js, DB2, and IBM Cloudant—to keep current clients engaged, while designing and building the next version on a new stack and hosting platform.",
      impact:
        "Accelerated KS2's product roadmap: steadier reliability and feature delivery on the live platform, plus meaningful progress on the greenfield rewrite ready for market.",
      tech_stack: [
        "Node.js",
        "Angular",
        "PostgreSQL",
        "Sequelize",
        "DB2",
        "IBM Cloudant",
      ],
    },
  },
  {
    exhibitSlug: "exhibit-candidate-vantage",
    pageSlug: "candidate-vantage",
    sortOrder: 2,
    pageTitle: "Candidate Vantage — AI Job Fit Scoring",
    metaDesc:
      "AI-driven lead scoring that evaluates job descriptions against historical suitability and behavioral data.",
    data: {
      title: "Candidate Vantage",
      client: "Fast Dog Coding, LLC (Internal)",
      role: "AI Architect / Sole Proprietor",
      lede: "We built an AI-driven lead scoring tool that evaluates job descriptions on a 1–5 scale based on historical suitability and behavioral data.",
      challenge:
        "Evaluating whether a job posting is worth pursuing means weighing fit, risk, and opportunity cost—often with incomplete information and no structured way to learn from past decisions.",
      approach:
        "We built an Nx monorepo with a NestJS backend and Angular frontend: a Chrome extension scrapes job postings, Google Gemini AI scores them against a personal profile stored in MongoDB, auto-archives low fits, generates tailored resumes and cover letters, sends Slack alerts for high-value matches, and provides a Kanban dashboard with real-time updates via Socket.io.",
      impact:
        "Faster, more consistent prioritization of opportunities aligned with real track record—not just headline requirements.",
      tech_stack: [
        "Node.js",
        "OpenAI API (Assistants)",
        "Vector Stores",
        "TypeScript",
        "NestJS",
        "Angular",
        "Nx",
        "Prisma",
        "PostgreSQL",
        "MongoDB",
        "Google Gemini",
        "Socket.io",
        "Chrome Extension",
        "Slack",
      ],
    },
  },
  {
    exhibitSlug: "exhibit-candidate-concierge",
    pageSlug: "candidate-concierge",
    sortOrder: 3,
    pageTitle: "Candidate Concierge — AI-Powered RAG Chatbot",
    metaDesc:
      "Vercel-hosted chatbot utilizing RAG for real-time, context-aware professional capability responses.",
    data: {
      title: "Candidate Concierge",
      client: "Fast Dog Coding, LLC (Internal)",
      role: "AI Architect / Sole Proprietor",
      lede: "We built a Vercel-hosted chatbot utilizing RAG to provide real-time, context-aware responses regarding professional capabilities.",
      challenge:
        "Traditional resumes and portfolios are static—they cannot answer follow-up questions or adapt to context-specific inquiries about experience and fit.",
      approach:
        "We designed and deployed a Retrieval-Augmented Generation chatbot on Vercel, loading professional documentation from a MongoDB knowledge base into the system prompt and routing LLM requests through OpenRouter so responses stay grounded in retrievable facts rather than speculation.",
      impact:
        "An always-available AI concierge that discusses experience, technical capabilities, and project history with sourced accuracy. The app is available to try at https://candidate-concierge.fastdogcoding.com/.",
      tech_stack: [
        "AWS App Runner",
        "Node.js",
        "OpenAI API",
        "Vector Stores",
        "RAG",
        "Express",
        "EJS",
        "MongoDB",
        "Mongoose",
        "OpenRouter",
        "LLM",
        "Vercel",
        "Winston",
      ],
    },
  },
  {
    exhibitSlug: "exhibit-edvisor",
    pageSlug: "edvisor",
    sortOrder: 5,
    pageTitle: "Edvisor — LMS Modernization",
    metaDesc:
      "High-stakes migration of a global LMS serving 80,000 employees from legacy IBM Domino to a modern stack.",
      testimonialSlug: "testimonial-andrew",
      data: {
      title: "Edvisor",
      client: "REDspace, Inc. (for Kyndryl)",
      role: "Modernization Lead",
      lede: "We executed a high-stakes migration of a global LMS serving 80,000 employees from legacy IBM Domino to a modern stack under aggressive sunset deadlines.",
      challenge:
        "A global learning management system serving tens of thousands of employees faced a hard platform sunset—requiring a complete migration off IBM Domino without disrupting learners or administrators.",
      approach:
        "We led the modernization effort on an accelerated timeline, delivering Node.js and Express services backed by MongoDB and RESTful APIs while bridging coexistence with the legacy Domino environment.",
      impact:
        "Successful cutover to a modern stack before the sunset window closed, preserving continuity for a workforce-scale LMS.",
      tech_stack: [
        "Node.js",
        "Express",
        "MongoDB",
        "RESTful APIs",
        "IBM Domino",
      ],
    },
  },
  {
    exhibitSlug: "exhibit-lita",
    pageSlug: "lita",
    sortOrder: 6,
    pageTitle: "CMS and Storefront — Lydz in the Attic",
    metaDesc:
      "Custom CMS and storefront for a textile creator with advanced filtering, authentication, and image carousel.",
    data: {
      title: "CMS and Storefront",
      client: "Lydz in the Attic (LITA)",
      role: "Full-Stack Developer / Architect",
      lede: "We engineered a custom CMS and storefront for a textile creator, featuring advanced filtering, secure authentication, and a high-performance image carousel.",
      challenge:
        "A small creative business needed a storefront that could showcase visual inventory richly while remaining easy for a non-technical owner to manage day to day.",
      approach:
        "We architected and built a full-stack solution with Node.js and Express, IBM Cloudant for flexible content storage, and an Angular TypeScript front end tuned for catalog browsing and merchandising workflows.",
      impact:
        "A tailored commerce experience that matched the brand's aesthetic and operational needs without off-the-shelf platform compromises.",
      tech_stack: [
        "Node.js",
        "Express",
        "IBM Cloudant",
        "Angular",
        "TypeScript",
      ],
    },
  },
  {
    exhibitSlug: "exhibit-resume-app",
    pageSlug: "resume-app",
    sortOrder: 7,
    pageTitle: "Resume App — Interactive Data-Driven Resume",
    metaDesc:
      "An interactive resume that both tells and shows career history—always current at a single URL and serving as a live skills demonstration.",
    data: {
      title: "Resume App",
      client: "Fast Dog Coding, LLC (Internal)",
      role: "Principal Architect / Sole Proprietor",
      lede: "We built an interactive, data-driven resume that both tells and shows career history—always current at a single URL and serving as a live skills demonstration.",
      challenge:
        "Proprietary client work cannot be shown publicly; needed a demonstration application that proves skills while delivering a resume above the ordinary printed variety.",
      approach:
        "We merged resume and demo app into one Express application with Handlebars views, IBM Cloudant for structured career data, and D3.js visualizations—deployed on IBM Cloud Foundry. Open-sourced on GitHub for pre-interview technical review.",
      impact:
        "Always-up-to-date resume link that never goes stale; saves interviewers time with inspectable source code; foundation for future dynamic Word export from the same data source.",
      tech_stack: [
        "Node.js",
        "Express",
        "Handlebars",
        "IBM Cloudant",
        "D3.js",
        "IBM Cloud Foundry",
      ],
    },
  },
  {
    exhibitSlug: "exhibit-dlg",
    pageSlug: "digital-learning-guide",
    sortOrder: 8,
    pageTitle: "Digital Learning Guide — Global Learning Ecosystem",
    metaDesc:
      "Multi-year evolution of a global learning ecosystem serving IBM's worldwide workforce.",
    testimonialSlug: "testimonial-jenn",
    data: {
      title: "Digital Learning Guide",
      client: "REDspace, Inc. (for IBM)",
      role: "Principal Developer",
      lede: "We led a multi-year evolution of a global learning ecosystem, including automated data sync and a comprehensive reviewer dashboard.",
      challenge:
        "IBM's global learning platform needed continuous evolution to serve a worldwide workforce with reliable content delivery, automated synchronization across backends, and a robust editorial workflow for reviewers.",
      approach:
        "Over a sustained engagement we led technical evolution—designing a Worker Queue for automated data sync, building a comprehensive reviewer dashboard, and modernizing toward Node.js, Express, and Angular on IBM Cloudant and IBM Cloud.",
      impact:
        "A durable piece of IBM's global learning infrastructure, demonstrating the value of sustained architectural investment at enterprise scale.",
      tech_stack: [
        "Node.js",
        "Express",
        "IBM Cloudant",
        "IBM Cloud",
        "Angular",
        "TypeScript",
      ],
    },
  },
  {
    exhibitSlug: "exhibit-compliance-attender",
    pageSlug: "compliance-attender",
    sortOrder: 9,
    pageTitle: "Compliance Attender — Real-Time DLP on Domino",
    metaDesc:
      "C++ server add-in for real-time email interception and data-leakage prevention on IBM Domino.",
    data: {
      title: "Compliance Attender",
      client: "Sherpa Software",
      role: "Senior Product Developer",
      lede: "Engineered a C++ server add-in for real-time email interception and data-leakage prevention (DLP) on IBM Domino.",
      challenge:
        "Organizations needed to enforce data-leakage policies at the mail server boundary—intercepting sensitive content in flight without degrading messaging performance or reliability.",
      approach:
        "Developed a C++ Domino server add-in using the IBM Domino C API and real-time messaging hooks to inspect and act on email traffic as it moved through the infrastructure.",
      impact:
        "Production-grade DLP capability integrated directly into the messaging path customers already trusted.",
      tech_stack: ["C++", "IBM Domino C API", "Real-time Messaging"],
    },
  },
  {
    exhibitSlug: "exhibit-phoenix",
    pageSlug: "phoenix",
    sortOrder: 10,
    pageTitle: "Phoenix — Investment Lifecycle Management",
    metaDesc:
      "Venture capital intake and tracking from initial solicitation through follow-on funding with compliance reporting.",
    data: {
      title: "Phoenix",
      client: "Innovation Works, Inc.",
      role: "Senior Product Developer",
      lede: "Built comprehensive intake and tracking for venture capital investment opportunities across the full funding lifecycle.",
      challenge:
        "Seed-stage investment programs required rigorous tracking from first solicitation through multiple funding rounds, with reporting that satisfied state-level compliance and audit requirements.",
      approach:
        "Engineered the application on IBM Notes and Domino with LotusScript, including mission-critical reporting modules aligned to regulatory obligations for seed-stage investments.",
      impact:
        "A dependable system of record for opportunity flow, follow-on rounds, and mandated compliance outputs.",
      tech_stack: ["IBM Notes & Domino", "LotusScript"],
    },
  },
  {
    exhibitSlug: "exhibit-exposure-monitoring",
    pageSlug: "exposure-monitoring",
    sortOrder: 11,
    pageTitle: "Exposure Monitoring System — Industrial Hygiene",
    metaDesc:
      "Data management for industrial hygienists tracking workforce exposure and OSHA compliance.",
    data: {
      title: "Exposure Monitoring System",
      client: "CISCorp (for Bayer, Inc.)",
      role: "Senior Product Developer",
      lede: "Built specialized data management for industrial hygienists monitoring workforce exposure to hazardous chemicals, noise, and radiation.",
      challenge:
        "Industrial hygiene teams needed to correlate field samples, personnel, locations, and laboratory results to support mandatory OSHA compliance reporting.",
      approach:
        "Architected a Domino-based application that streamlined end-to-end tracking of sampling events and outcomes, giving hygienists a single system for exposure records and audit trails.",
      impact:
        "More reliable exposure documentation and faster path to compliance-ready reporting.",
      tech_stack: ["IBM Notes & Domino", "LotusScript"],
    },
  },
  {
    exhibitSlug: "exhibit-buzzzone",
    pageSlug: "buzzzone",
    sortOrder: 12,
    pageTitle: "BuzzZone — Bilingual Enterprise Intranet",
    metaDesc:
      "Company-wide bilingual intranet launched in ten weeks for branch employees moving off green-screen terminals.",
    data: {
      title: "BuzzZone",
      client: "Zurich Insurance (Canada)",
      role: "Principal Developer",
      lede: "Engineered and launched a bilingual (English/French) company-wide intranet within a strict ten-week deadline.",
      challenge:
        "Branch employees transitioning from green-screen terminals needed a modern intranet experience—bilingual, editor-friendly, and deliverable on an immovable go-live date.",
      approach:
        "Built a split-screen translation interface for Notes client editors and leveraged Domino HTTP capabilities to serve web content at scale, coordinating delivery across language and platform constraints.",
      impact:
        "Successful launch on schedule, giving the organization a credible intranet foundation during a major workplace technology shift.",
      tech_stack: ["IBM Notes & Domino 4.6", "Legacy Web Development"],
    },
  },
];
