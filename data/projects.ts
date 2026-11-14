type ProjectImage = { src: string; alt: string; width: number; height: number };

export type ProjectLink = { label: string; href: string; ariaLabel: string };

export type Project = {
  order: number;
  objectPosition?: string;
  media: readonly [main?: ProjectImage, detail?: ProjectImage];
  slug: "finora" | "veyra" | "aptly" | "nikot-e-metro" | "luma";
  kind: "Team" | "Solo";
  year: number;
  month?: string;
  name: string; category: string; title: string; description: string;
  technologies: readonly string[]; github: string; live: string;
  links?: readonly ProjectLink[];
};

export const finoraDate = { year: 2026, month: "July" } as const;
const finoraSummary = "Hackathon team project, 2nd runner-up. I produced the demo video and pitch.";
export const finoraResultsLink = {
  label: "Results",
  href: "https://www.kaggle.com/competitions/gemma-ai-buildathon/hackathon-winners",
  ariaLabel: "Results (Kaggle, opens in a new tab)",
} satisfies ProjectLink;

// Public project facts verified against the adjacent original portfolio and project source.
// See docs/implementation.md for source locations. Visual studies are not screenshots.
export const projects: readonly Project[] = [
  {
    slug: "finora", kind: "Team", name: "Finora", category: "AI / MULTI-AGENT SYSTEMS",
    ...finoraDate,
    order: 1, media: [],
    title: finoraSummary,
    description: finoraSummary,
    technologies: ["Python", "Multi-agent orchestration", "Language models"],
    github: "https://github.com/Adhirajsingh2507/Error-404-Not-Found", live: "https://vibeforge-cyan.vercel.app/",
    links: [
      {
        label: "Competition writeup",
        href: "https://www.kaggle.com/competitions/gemma-ai-buildathon/writeups/multi-agent-personal-cfo",
        ariaLabel: "Competition writeup (Kaggle, opens in a new tab)",
      },
      finoraResultsLink,
    ],
  },
  {
    slug: "veyra", kind: "Solo", name: "VEYRA", category: "CREATIVE FRONTEND / FINANCIAL VISUALIZATION",
    order: 2, year: 2026, media: [],
    title: "Make sense of the flow.",
    description: "A frontend-focused budget analysis experience. Transactions become categories, calculations, and financial observations through a considered visual interface and client-side state.",
    technologies: ["Next.js", "TypeScript", "Zustand", "GSAP"],
    github: "https://github.com/vedii-codezz/budget-analysis-veyra", live: "https://budget-analysis-veyra.vercel.app/",
  },
  {
    slug: "aptly", kind: "Solo", name: "APTLY", category: "AI / EXPLAINABLE OPPORTUNITY INTELLIGENCE",
    order: 3, year: 2026, media: [],
    title: "Not just if you fit. Why.",
    description: "An explainable job eligibility and ATS assistant that compares candidate evidence with opportunity requirements. Gemini interprets messy language; a deterministic TypeScript engine decides eligibility.",
    technologies: ["Next.js", "TypeScript", "Gemini", "Zod"],
    github: "https://github.com/vedii-codezz/aptly", live: "https://aptly-chi.vercel.app/",
  },
  {
    slug: "nikot-e-metro", kind: "Solo", name: "Nikot-e-Metro", category: "SPATIAL COMPUTATION / INTERACTIVE NAVIGATION",
    order: 4, year: 2026, media: [],
    title: "A city, more connected.",
    description: "A Kolkata Metro navigation experience connecting user location, nearby stations, routes, and interchanges. Spatial discovery and graph-based routing help make the journey easier to understand.",
    technologies: ["Next.js", "TypeScript", "MapLibre", "Drizzle ORM"],
    github: "https://github.com/vedii-codezz/nikot-e-metro", live: "https://nikot-e-metro.vercel.app/",
  },
  {
    slug: "luma", kind: "Solo", name: "LUMA", category: "FULL-STACK / STUDY WORKSPACE",
    order: 5, year: 2026, media: [],
    title: "A clearer space to learn.",
    description: "An editorial study workspace with a sample study experience, subject organization, and implemented Supabase authentication and private PDF upload/download flows. Live mode requires backend configuration; AI tutoring and generated practice remain planned.",
    technologies: ["Next.js", "TypeScript", "Supabase", "Tailwind CSS", "Framer Motion"],
    github: "https://github.com/vedii-codezz/luma", live: "https://luma-rust-beta.vercel.app/",
  },
];
