import { readdirSync, statSync } from "node:fs";
import { join, parse } from "node:path";
import { finoraResultsLink, projects, type Project } from "./projects";

type StoryLink =
  | { label: string; caseStudy: Project["slug"] }
  | { label: string; href: string; ariaLabel?: string };

export type StoryChapter = {
  id: string;
  kind: "education" | "hackathon" | "projects" | "coding" | "certification" | "next";
  title: string;
  period: string;
  summary: string;
  details: readonly string[];
  links: readonly StoryLink[];
  status: "published" | "draft";
  academicStanding?: {
    currentTerm: string;
    cgpa: string;
    sgpa: readonly { semester: number; value: string }[];
    asOf: string;
  };
};

function certificateLinks(basename: string, event: string): StoryLink[] {
  const directory = join(process.cwd(), "public", "certificates");
  let files;
  try {
    files = readdirSync(directory);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }

  // TODO(verify): If no matching PDF or image is found, confirm the uploaded certificate's basename.
  const file = files.find(filename => {
    const { name, ext } = parse(filename);
    return name === basename && /^\.(pdf|png|jpe?g|webp|gif|avif|svg)$/i.test(ext)
      && statSync(join(directory, filename), { throwIfNoEntry: false })?.isFile();
  });
  if (!file) return [];

  const format = parse(file).ext.toLowerCase() === ".pdf" ? "PDF" : "image";
  return [{
    label: "Certificate of participation",
    href: `/certificates/${encodeURIComponent(file)}`,
    ariaLabel: `Certificate of participation, ${event} (${format}, opens in a new tab)`,
  }];
}

const finoraLinks = projects.find(project => project.slug === "finora")?.links ?? [];

const chapters: readonly StoryChapter[] = [
  {
    id: "techno-india-btech",
    kind: "education",
    title: "Techno India University",
    period: "August 2025 – August 2029 (expected)",
    summary: "B.Tech in Computer Science with Specialization in Artificial Intelligence",
    details: [],
    links: [],
    status: "published",
    academicStanding: {
      currentTerm: "Currently in 2nd year, 3rd semester",
      cgpa: "9.1",
      sgpa: [{ semester: 1, value: "9.16" }, { semester: 2, value: "9.04" }],
      asOf: "November 2026",
    },
  },
  {
    id: "finora",
    kind: "hackathon",
    title: "Build with Gemma: GDG TIU Buildathon",
    period: "July 24–25, 2026",
    summary: "A buildathon on Google DeepMind's Gemma models. Our team, The Orchestrators, placed 2nd runner-up with Finora, and I produced the demo video and the pitch.",
    details: [],
    links: [
      { label: "Finora", caseStudy: "finora" },
      finoraResultsLink,
      ...finoraLinks.filter(link => link.label === "Competition writeup"),
      ...certificateLinks("BedantikaMondal-Buildathon", "Build with Gemma: GDG TIU Buildathon"),
    ],
    status: "published",
  },
  {
    id: "hackrit",
    kind: "hackathon",
    title: "Hackrit",
    period: "September 10–11, 2026",
    summary: "Participated in Hackrit, a 24-hour on-campus hackathon organised by GDG TIU.",
    details: [],
    links: certificateLinks("BedantikaMondal-Hackrit", "Hackrit"),
    status: "published",
  },
  // Waiting on Bedantika's input.
  {
    id: "TODO competitive programming",
    kind: "coding",
    title: "TODO Competitive programming",
    period: "TODO",
    summary: "TODO",
    details: ["TODO rating or milestones"],
    links: [{ label: "TODO profile link", href: "TODO" }],
    status: "draft",
  },
  // Waiting on Bedantika's input.
  {
    id: "TODO certifications",
    kind: "certification",
    title: "TODO Certifications",
    period: "TODO",
    summary: "TODO",
    details: ["TODO list"],
    links: [{ label: "TODO", href: "TODO" }],
    status: "draft",
  },
  // Waiting on Bedantika's input.
  {
    id: "TODO activities",
    kind: "next",
    title: "TODO Clubs, leadership or workshops",
    period: "TODO",
    summary: "TODO",
    details: ["TODO"],
    links: [{ label: "TODO", href: "TODO" }],
    status: "draft",
  },
  // Waiting on Bedantika's input.
  {
    id: "TODO next chapter",
    kind: "next",
    title: "TODO Next chapter",
    period: "TODO",
    summary: "TODO what's coming next",
    details: ["TODO"],
    links: [{ label: "TODO", href: "TODO" }],
    status: "draft",
  },
];

export const publishedChapters = chapters.filter(chapter => chapter.status === "published");
