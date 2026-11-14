"use client";

import { fullMotionQuery } from "./motion-preference";
import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { carouselDescriptions, type Project } from "@/data/projects";
export function ProjectDetailsPanel({ project, index }: { project: Project; index: number }) {
  const panel = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const media = gsap.matchMedia();
    media.add(fullMotionQuery, () => {
      gsap.fromTo(panel.current?.querySelectorAll("[data-detail]") ?? [],
        { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .3, stagger: .035, ease: "power2.out", clearProps: "transform,opacity" });
    });
    return () => media.revert();
  }, [project.slug]);
  return <article ref={panel} className="project-details" aria-labelledby="work-project-title">
    <p className="project-details-label" data-detail>{String(index + 1).padStart(2, "0")} / {project.category}</p>
    <div className="project-details-title"><h3 id="work-project-title" data-detail>{project.name}</h3></div>
    <p className="project-details-description" data-detail>{carouselDescriptions[project.slug]}</p>
    <div className="project-details-links" data-detail>
      <a href={project.live} target="_blank" rel="noopener noreferrer" aria-label={`${project.name} Live Demo (opens in new tab)`}>Live Demo <span aria-hidden="true">↗</span></a>
      <a href={project.github} target="_blank" rel="noopener noreferrer" aria-label={`${project.name} GitHub Source (opens in new tab)`}>GitHub Source <span aria-hidden="true">↗</span></a>
    </div>
  </article>;
}
