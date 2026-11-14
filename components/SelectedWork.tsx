"use client";
import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { projects, type Project } from "@/data/projects";
import { ProjectVisual } from "./ProjectVisual";
import { ProjectDetailsPanel } from "./ProjectDetailsPanel";
import CircularCarousel from "./CircularCarousel";

const CaseStudyDialog = dynamic(() => import("./CaseStudyDialog"), { ssr: false });

export function SelectedWork() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [caseStudy, setCaseStudy] = useState<Project["slug"] | null>(null);
  const trigger = useRef<HTMLElement>(null);
  const commit = (index: number) => { setSelectedIndex(index); setHoveredIndex(null); };
  const openCaseStudy = (slug: Project["slug"], element: HTMLElement) => {
    trigger.current = element;
    setCaseStudy(slug);
  };
  const closeCaseStudy = () => {
    setCaseStudy(null);
    trigger.current?.focus({ preventScroll: true });
  };
  const detailsIndex = hoveredIndex ?? selectedIndex;
  return <section className="work section-pad" id="work" aria-labelledby="work-title">
    <div className="section-eyebrow mono" data-reveal><span><i /> 02 / SELECTED WORK</span><span>A FEW THINGS I&apos;VE PUT MY MIND INTO</span></div>
    <div className="work-heading" data-reveal><h2 id="work-title">Curiosity,<br /><em>put to work.</em></h2><div><span className="work-count">{String(projects.length).padStart(2, "0")}<span> / PROJECTS</span></span><p>Intelligent at the core.<br />Expressive on the surface.</p></div></div>
    <div className="work-exhibition">
      <ProjectDetailsPanel project={projects[detailsIndex]} index={detailsIndex}
        onOpen={element => openCaseStudy(projects[detailsIndex].slug, element)} />
      <CircularCarousel selectedIndex={selectedIndex} onChange={commit} onPreview={setHoveredIndex}
        onActivate={(index, element) => openCaseStudy(projects[index].slug, element)}
        items={projects.map(project => ({ id: project.slug, title: project.name, kind: project.kind,
          artwork: <ProjectVisual slug={project.slug} compact /> }))} />
    </div>
    <div className="work-end mono"><span>END OF SELECTED WORK</span><span aria-hidden="true">✳</span><span>STILL CURIOUS. STILL CREATING.</span></div>
    {caseStudy && <CaseStudyDialog slug={caseStudy} onClose={closeCaseStudy} />}
  </section>;
}
