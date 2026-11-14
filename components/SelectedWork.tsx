"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useRef, useState, type MouseEvent } from "react";
import { projects, type Project } from "@/data/projects";
import { ProjectVisual } from "./ProjectVisual";

const CaseStudyDialog = dynamic(() => import("./CaseStudyDialog"), { ssr: false });

export function SelectedWork() {
  const [caseStudy, setCaseStudy] = useState<Project["slug"] | null>(null);
  const trigger = useRef<HTMLAnchorElement>(null);

  function openCaseStudy(event: MouseEvent<HTMLAnchorElement>, slug: Project["slug"]) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    trigger.current = event.currentTarget.closest(".work-lane-detail")
      ? document.querySelector<HTMLAnchorElement>(`.work-lane:not(.work-lane-detail) [data-project="${slug}"]`)
      : event.currentTarget;
    setCaseStudy(slug);
  }

  function closeCaseStudy() {
    setCaseStudy(null);
    trigger.current?.focus({ preventScroll: true });
  }

  return (
    <section className="work section-pad" id="work" aria-labelledby="work-title">
      <div className="section-eyebrow mono"><span><i /> 02 / SELECTED WORK</span><span>A FEW THINGS I&apos;VE PUT MY MIND INTO</span></div>
      <div className="work-heading"><h2 id="work-title">Curiosity,<br /><em>put to work.</em></h2><div><span className="work-count">{String(projects.length).padStart(2, "0")}<span> / PROJECTS</span></span><p>Intelligent at the core.<br />Expressive on the surface.</p></div></div>
      <div className="work-showcase">
        <div className="work-rows">
          {[false, true].map(detail => (
            <div className={detail ? "work-lane work-lane-detail" : "work-lane"} key={String(detail)}>
              <div className="work-track">
                {projects.map((project, index) => {
                  const media = project.media[detail ? 1 : 0] ?? project.media[0];
                  return (
                    <a className="work-card" key={project.slug} href={project.live} data-project={project.slug}
                      tabIndex={detail ? -1 : undefined} aria-hidden={detail || undefined}
                      onMouseDown={event => { if (event.button === 0) event.preventDefault(); }}
                      onClick={event => openCaseStudy(event, project.slug)}
                      onFocus={event => {
                        event.currentTarget.scrollIntoView({ block: "nearest", inline: "center", behavior: "instant" });
                      }}>
                      <div className="work-art">
                        {media
                          ? <Image src={media.src} alt={media.alt} width={media.width} height={media.height}
                            sizes="(min-width: 1024px) 480px, 88vw" loading="lazy" />
                          : <ProjectVisual slug={project.slug} />}
                      </div>
                      <div className="work-caption">
                        <span className="mono">{String(index + 1).padStart(2, "0")}</span>
                        <div>
                          {detail ? <p className="work-card-name">{project.name}</p> : <h3 className="work-card-name">{project.name}</h3>}
                          <p>{project.title}</p>
                        </div>
                        <span className="work-kind mono">{project.kind}</span>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="work-end mono"><span>END OF SELECTED WORK</span><span aria-hidden="true">✳</span><span>STILL CURIOUS. STILL CREATING.</span></div>
      {caseStudy && <CaseStudyDialog slug={caseStudy} onClose={closeCaseStudy} />}
    </section>
  );
}
