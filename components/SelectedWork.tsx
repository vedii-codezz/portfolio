"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { projects, type Project } from "@/data/projects";
import type { AccordionGalleryItem } from "./AccordionGallery";
import { ProjectVisual } from "./ProjectVisual";

const AccordionGallery = dynamic(() => import("./AccordionGallery"), { ssr: false });
const CaseStudyDialog = dynamic(() => import("./CaseStudyDialog"), { ssr: false });

const ordered = [...projects].sort((a, b) => a.order - b.order);
const items = ordered.map(project => ({
  project,
  image: project.media[0]?.src ?? "",
  label: project.name,
  meta: project.title,
  link: "#",
}));
const scrollPerItem = .55;

function WorkHeader() {
  return <>
    <div className="section-eyebrow mono"><span><i /> 02 / SELECTED WORK</span><span>A FEW THINGS I&apos;VE PUT MY MIND INTO</span></div>
    <div className="work-heading"><h2 id="work-title">Curiosity,<br /><em>put to work.</em></h2><div><span className="work-count">{String(items.length).padStart(2, "0")}<span> / PROJECTS</span></span><p>Intelligent at the core.<br />Expressive on the surface.</p></div></div>
  </>;
}

function renderImage(item: AccordionGalleryItem, { className }: { className: string }) {
  const project = items.find(candidate => candidate === item)?.project;
  if (!project) return null;
  const image = project.media[0];
  return image
    ? <Image className={className} src={item.image} alt={image.alt} width={image.width} height={image.height}
        style={{ objectPosition: project.objectPosition ?? "center top" }}
        sizes="(max-width: 1023px) 88vw, 45vw" loading="lazy" draggable={false} />
    : <div className={className}><ProjectVisual slug={project.slug} /></div>;
}

export function SelectedWork() {
  const section = useRef<HTMLElement>(null);
  const trigger = useRef<HTMLElement>(null);
  const [near, setNear] = useState(false);
  const [caseStudy, setCaseStudy] = useState<Project["slug"] | null>(null);

  useEffect(() => {
    const element = section.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setNear(true);
      observer.disconnect();
    }, { rootMargin: "200px 0px" });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={section} className="work section-pad work-accordion" id="work" aria-labelledby="work-title">
      <div className="work-gallery-slot">
        <div className="work-gallery-placeholder">
          <div className="work-gallery-placeholder-header"><WorkHeader /></div>
          <div className="work-gallery-skeleton" aria-hidden="true" />
          <noscript>
            <ol className="work-gallery-links">
              {ordered.map(project => <li key={project.slug}><a href={project.live}>{project.name}</a> · {project.title}</li>)}
            </ol>
          </noscript>
          <div className="work-gallery-scroll-space" style={{ height: `${(items.length - 1) * scrollPerItem * 100}vh` }} aria-hidden="true" />
        </div>
        {near && <AccordionGallery items={items} header={<WorkHeader />} defaultIndex={0} trigger="scroll"
          accentColor="var(--accent)" overlayColor="var(--surface)" textColor="var(--foreground)"
          height={420} radius={0} mobileHeight={640} mobileBreakpoint={1023} scrollPerItem={scrollPerItem}
          tilt={0} parallax={0} grayscale={false} renderImage={renderImage}
          onItemClick={(_, index, event) => {
            event.preventDefault();
            trigger.current = event.currentTarget;
            setCaseStudy(ordered[index].slug);
          }} />}
      </div>
      <div className="work-end mono"><span>END OF SELECTED WORK</span><span aria-hidden="true">✳</span><span>STILL CURIOUS. STILL CREATING.</span></div>
      {caseStudy && <CaseStudyDialog slug={caseStudy} onClose={() => {
        setCaseStudy(null);
        trigger.current?.focus({ preventScroll: true });
      }} />}
    </section>
  );
}
