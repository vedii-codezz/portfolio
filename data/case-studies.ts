import type { Project } from "./projects";

export type CaseStudy = {
  slug: Project["slug"];
  order: number;
  number: string;
  name: string;
  tagline: string;
  kind: Project["kind"];
  year: number;
  month: string | null;
  role: string;
  problem: string;
  project: string[];
  contributions: string[];
  contributionNote?: string;
  stack: string[];
  stackNote?: string;
  result: string;
  links: { demo: string; github: string };
  media: { src: string; alt: string; width: number; height: number; kind: "image" | "video" }[];
};

export const caseStudies: readonly CaseStudy[] = [
  {
    slug: "finora",
    order: 1,
    number: "01",
    name: "FINORA",
    tagline: "Your money, finally with a brain.",
    kind: "Team",
    year: 2026,
    month: null,
    role: "Demo Video Production & Pitch Presentation",
    problem: "Traditional personal finance applications provide financial data but often fail to translate it into clear, actionable guidance. Users need a more intelligent way to understand their finances and make informed financial decisions.",
    project: [
      "Finora is an AI-powered personal finance platform developed by our team, featuring a multi-agent architecture that analyzes financial information and generates personalized recommendations.",
      "The system combines specialized AI agents, deterministic financial calculations, and interactive dashboards to make financial insights more accessible and explainable.",
    ],
    contributions: [
      "Created the project demonstration video, showcasing Finora's key features, functionality, and user experience.",
      "Developed the pitch speech, translating complex technical concepts into a clear, engaging presentation.",
      "Helped communicate the project's problem statement, proposed solution, and value proposition.",
    ],
    stack: ["Python", "FastAPI", "Groq LLM", "Three.js", "Multi-Agent AI"],
    stackNote: "Technologies used by the team, not a representation of my individual development contribution.",
    result: "Contributed to the team's project presentation by producing its demonstration video and pitch narrative. Strengthened my technical storytelling, product communication, and ability to explain complex AI systems to an audience.",
    links: { demo: "https://vibeforge-cyan.vercel.app/", github: "https://github.com/Adhirajsingh2507/Error-404-Not-Found" },
    media: [],
  },
  {
    slug: "veyra",
    order: 2,
    number: "02",
    name: "VEYRA",
    tagline: "Your money, in focus.",
    kind: "Solo",
    year: 2026,
    month: null,
    role: "Full-Stack Development, Financial Logic & UI/UX",
    problem: "Personal finance applications often overwhelm users with raw transactions, complicated dashboards, and disconnected financial metrics. Understanding spending habits, savings performance, and overall financial health should be intuitive rather than requiring extensive manual analysis.",
    project: [
      "VEYRA is an immersive personal finance and budget analysis platform that transforms financial data into interactive visual insights. It features a custom calculation engine for savings rates, spending patterns, budget allocation, and the composite VEYRA SCORE, a financial health indicator.",
      "The interface combines a transaction ledger, analytical dashboards, and scroll-driven financial storytelling.",
    ],
    contributions: [
      "Designed and implemented the financial calculation engine for savings rates, burn pace, category budgets, and the VEYRA SCORE.",
      "Built interactive dashboards and transaction-management interfaces using Next.js and TypeScript.",
      "Developed the cinematic UI with GSAP, Framer Motion, smooth scrolling, and responsive layouts.",
    ],
    stack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Zustand", "GSAP", "Framer Motion", "Lenis"],
    // TODO(verify): the word "accessible" in result.
    result: "Developed and deployed an interactive finance analysis application. Learned to separate financial business logic from presentation while combining accurate calculations with creative, accessible frontend experiences.",
    links: { demo: "https://budget-analysis-veyra.vercel.app/", github: "https://github.com/vedii-codezz/budget-analysis-veyra" },
    media: [],
  },
  {
    slug: "aptly",
    order: 3,
    number: "03",
    name: "APTLY",
    tagline: "Not just whether you fit. Why.",
    kind: "Solo",
    year: 2026,
    month: null,
    role: "AI Integration, Decision-Engine Development & Full-Stack Engineering",
    problem: "Students and early-career applicants struggle to determine whether their resumes satisfy internship and job requirements. Conventional ATS scanners and AI matching tools frequently rely on unexplained similarity scores, making it difficult to distinguish actual eligibility restrictions from improvable skill gaps.",
    project: [
      "APTLY is an explainable opportunity-intelligence platform that compares candidate profiles and resumes against structured internship or job requirements.",
      "It uses the Gemini API to extract and normalize unstructured information, followed by a deterministic TypeScript engine that evaluates eligibility, competitiveness, evidence quality, and missing requirements. The platform also provides ATS analysis and personalized improvement strategies without inventing hiring probabilities.",
    ],
    contributions: [
      "Developed the Gemini-powered requirement extraction and normalization pipeline with structured validation.",
      "Designed deterministic eligibility and matching logic that distinguishes matched, partial, failed, and unknown requirements.",
      "Implemented resume parsing, evidence tracing, ATS analysis, and actionable skill-gap recommendations.",
    ],
    stack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Gemini API", "Zod", "Zustand", "Framer Motion"],
    // TODO(verify): regression tests exist in the aptly repo.
    result: "Built and deployed an explainable resume-to-opportunity analysis system with automated validation and regression testing. Learned to combine generative AI with deterministic decision-making, ensuring that ambiguous evidence does not become an unsupported rejection or fabricated score.",
    links: { demo: "https://aptly-chi.vercel.app/", github: "https://github.com/vedii-codezz/aptly" },
    media: [],
  },
  {
    slug: "nikot-e-metro",
    order: 4,
    number: "04",
    name: "NIKOT-E-METRO",
    // TODO(verify): tagline's "Connect the last mile" matches what is implemented.
    tagline: "Find the nearest Metro. Plan across lines. Connect the last mile.",
    kind: "Solo",
    year: 2026,
    month: null,
    role: "Full-Stack Development, Geospatial Features & UI/UX",
    problem: "Kolkata Metro commuters, particularly first-time passengers and visitors, may struggle to identify the most convenient station from an unfamiliar landmark or location. Finding a nearby station is only part of the problem; understanding pedestrian access and planning across metro lines also matters.",
    project: [
      "Nikot-e-Metro is a Kolkata-focused metro discovery and journey-planning web application. Users can search for landmarks or use their location to discover nearby metro access and explore routes across the network.",
      "The application combines location-based discovery, interactive mapping, and metro navigation within a responsive interface.",
    ],
    contributions: [
      "Developed landmark-based and location-aware nearest-metro discovery interfaces.",
      "Integrated interactive mapping and route-oriented navigation features.",
      "Built the responsive application architecture and supporting data layer using Next.js, TypeScript, and database tooling.",
    ],
    stack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "MapLibre GL", "Drizzle ORM", "Neon PostgreSQL", "Framer Motion", "Zod"],
    result: "Deployed a working Kolkata Metro discovery and navigation web application. Gained practical experience designing location-aware interfaces and combining geospatial data with accessible, user-focused frontend development.",
    links: { demo: "https://nikot-e-metro.vercel.app/", github: "https://github.com/vedii-codezz/nikot-e-metro" },
    media: [],
  },
  {
    slug: "luma",
    order: 5,
    number: "05",
    name: "LUMA",
    tagline: "A smarter workspace for more focused learning.",
    kind: "Solo",
    year: 2026,
    month: "November",
    role: "Full-Stack Development, Product Architecture & AI Study-System Design",
    problem: "Students often manage notes, documents, quizzes, and revision schedules across disconnected applications, making it difficult to maintain a structured learning workflow. Most study tools focus on storing information rather than connecting learning materials, practice, and progress in one place.",
    project: [
      "LUMA is a study workspace designed to organize subjects, learning resources, revision, and practice into a unified experience. Its implemented foundation includes subject management, private PDF storage, authentication flows, and an interactive demonstration workspace.",
      "The demo explores AI tutoring, practice questions, concept tracking, and targeted revision. Live AI generation, retrieval-augmented tutoring, and computed mastery remain planned features rather than completed functionality.",
    ],
    contributions: [
      "Designed the study workspace architecture, subject-management workflows, and responsive frontend.",
      "Implemented Supabase-based authentication, private document storage, and owner-scoped data access.",
      "Developed reusable study-interface components and separate demonstration and authenticated workspace flows.",
    ],
    stack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Supabase", "PostgreSQL", "Framer Motion"],
    result: "Built and deployed an interactive study-workspace prototype with a functional application foundation and demo environment. Learned to structure a secure educational application using authentication, database access controls, private storage, and modular frontend architecture.",
    links: { demo: "https://luma-rust-beta.vercel.app/", github: "https://github.com/vedii-codezz/luma" },
    media: [],
  },
];
