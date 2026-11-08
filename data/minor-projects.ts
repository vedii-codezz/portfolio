export type MinorProject = {
  slug: "chroma-lab" | "itera";
  name: string;
  note: string;
  description: string;
  live: string;
  source: string;
};

// Descriptions verified against each project's repository README.
export const minorProjects: readonly MinorProject[] = [
  {
    slug: "chroma-lab",
    name: "Chroma Lab",
    note: "Studies in color",
    description: "An interactive color laboratory for exploring palettes, color harmonies, contrast, and UI combinations.",
    live: "https://chroma-lab-lovat.vercel.app/",
    source: "https://github.com/vedii-codezz/chromalab",
  },
  {
    slug: "itera",
    name: "Itera",
    note: "Studies in motion & logic",
    description: "An interactive algorithm visualizer that brings DSA concepts to life through step-by-step execution, pseudocode, and animated playback.",
    live: "https://itera-algo-visualizer.vercel.app/",
    source: "https://github.com/vedii-codezz/itera",
  },
];
