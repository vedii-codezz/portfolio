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
  academicStanding?: { label: string; cgpa: string };
};

const chapters: readonly StoryChapter[] = [
  {
    id: "techno-india-btech",
    kind: "education",
    title: "Techno India University",
    period: "August 2023 to August 2027 (expected)",
    summary: "A FOUNDATION IN INTELLIGENCE.\nA FUTURE OPEN TO POSSIBILITY.",
    details: ["B.Tech in Computer Science with Specialization in Artificial Intelligence"],
    links: [],
    status: "published",
    academicStanding: { label: "Currently pursuing", cgpa: "9.1" },
  },
  {
    id: "finora",
    kind: "hackathon",
    title: "Build with Gemma: GDG TIU Buildathon",
    period: "July 24–25, 2026",
    summary: "A buildathon on Google DeepMind's Gemma models. Our team placed 2nd runner-up with Finora, and I produced the demo video and the pitch.",
    details: [],
    links: [{ label: "Finora", caseStudy: "finora" }, finoraResultsLink],
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
  ...projects.filter(project => project.kind === "Solo").sort((a, b) => a.order - b.order).map((project): StoryChapter => ({
    id: project.slug,
    kind: "projects",
    title: project.name,
    period: project.month ? `${project.month} ${project.year}` : String(project.year),
    summary: project.title,
    details: [],
    links: [{ label: project.name, caseStudy: project.slug }],
    status: "published",
  })),
];

export const publishedChapters = chapters.filter(chapter => chapter.status === "published");
