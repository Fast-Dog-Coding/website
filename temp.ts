// --- Section Types ---
type Markdown = string;
type SectionTypes = "sections" | "hero" | "exhibit" | "testimonial" | "call_to_action" | "prose"; // ... etc.

interface Section {
    id: string;
    type: SectionTypes; // maps to a Component for rendering the content
    content?: Markdown; // content rendered by the component mapped to the section type.
    sections?: Section[]; // sections that should be rendered in the component mapped to the section type.
}

// interface Exhibit extends Section {
//     title: string; // project name
//     role: string; // my role on the project
//     client: string; // client name
//     lede: Markdown; // short summary of the project
//     challenge: Markdown; // what was the problem we were trying to solve?
//     approach: Markdown; // what was the solution we came up with?
//     impact: Markdown; // what was the outcome?
//     tech_stack: string[]; // technologies used
//     image?: Image; // image asset used in the project
//     testimonial?: Testimonial;
// }

// interface Image {
//     id: string;
//     alt: string;
//     url: string;
// }

// interface Testimonial extends Section {
//     name: string; // Full name of the person providing the testimonial
//     role: string; // Their role, e.g., "Director of Engineering"
//     relationship: string; // How the client knows me, e.g., "Former colleague"
//     company: string; // Their company
//     content: Prose; // the full testimonial
//     snippets?: Prose[]; // a few choice quotes from the testimonial. Can be used on the home page or projects
// }

// interface CallToAction extends Section {
//     href: string;
//     icon: string;
//     label: string;
//     micro_copy: Prose;
// }

// interface Hero extends Section {
//     heading: string;
//     subheading: string;
// }

// interface ExhibitGallery extends Section {
//     exhibits: Exhibit[];
// }



interface Page {
    id: string;
    title: string;
    description: string;
    slug: string; // url path; `about`, legal`, etc.
    is_published: boolean; // whether this page is published
    is_nav: boolean; // whether this page should appear in the main navigation
    nav_label: string; // the label that should appear in the main navigation
    display_order: number; // the order in which this page should appear in the main navigation
    sections: Section[]; // top down stack of sections on the page. Example; [Hero, Testimonial, CallToAction]
}

// ---


const exhibit: Section = {
    id: "1",
    type: "exhibit",
    sections: [
        {
            id: "6",
            type: "prose",
            content: "# Exhibit Title",
        },
        {
            id: "7",
            type: "prose",
            content: "Exhibit Lede",
        },
        {
            id: "10",
            type: "prose",
            content: "## Challenge",
        },
        {
            id: "8",
            type: "prose",
            content: "## Approach",
        },
        {
            id: "9",
            type: "prose",
            content: "## Impact",
        },
    ],
}

