"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { StoryChapter } from "@/data/story";
import type { Project } from "@/data/projects";
import { fullMotionQuery } from "./motion-preference";
import { JourneyLeaf, LotusJourney } from "./LotusJourney";

const CaseStudyDialog = dynamic(() => import("./CaseStudyDialog"), { ssr: false });

export function StoryChapters({ chapters }: { chapters: readonly StoryChapter[] }) {
  const [caseStudy, setCaseStudy] = useState<Project["slug"] | null>(null);
  const journey = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    const element = journey.current;
    if (!element) return;
    const media = matchMedia(fullMotionQuery);
    let near = false;
    let generation = 0;
    let cleanup: (() => void) | undefined;

    const update = async () => {
      const current = ++generation;
      cleanup?.();
      cleanup = undefined;
      if (!near || !media.matches) return;
      try {
        const { animateLotusJourney } = await import("./lotus-journey-motion");
        if (generation === current) cleanup = animateLotusJourney(element);
      } catch (error) {
        console.error("Could not load the lotus journey animation", error);
      }
    };
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      near = true;
      observer.disconnect();
      void update();
    }, { rootMargin: "600px 0px" });
    observer.observe(element);
    media.addEventListener("change", update);
    return () => {
      generation++;
      cleanup?.();
      observer.disconnect();
      media.removeEventListener("change", update);
    };
  }, []);

  return (
    <>
      <div className="story-journey" ref={journey}>
        <div className="journey-rail" aria-hidden="true">
          <svg className="journey-fallback" viewBox="0 0 100 300" preserveAspectRatio="none" focusable="false">
            <path d="M50 0Q74 15 50 38C22 64 22 104 50 138S78 212 50 238Q31 264 50 300" />
          </svg>
          <svg className="journey-spine" focusable="false">
            <path data-story-vine pathLength={1} />
          </svg>
        </div>
        <ol className="story-timeline" role="list">
          {chapters.map((chapter, index) => (
            <li className="story-chapter" key={chapter.id} data-chapter={chapter.kind}>
              <div className="story-node" aria-hidden="true">
                <JourneyLeaf index={index} />
                <LotusJourney />
              </div>
              <p className="story-period mono">{chapter.period}</p>
              <div className="story-copy">
                <h3>{chapter.title}</h3>
                <p>{chapter.summary}</p>
                {chapter.details.map(detail => (
                  <p key={detail} className={chapter.kind === "education" ? "story-education-summary mono" : undefined}>{detail}</p>
                ))}
                {chapter.academicStanding && (
                  <div className="story-academic mono">
                    <p>{chapter.academicStanding.currentTerm}</p>
                    <ul className="story-stats" role="list">
                      <li>CGPA {chapter.academicStanding.cgpa}</li>
                      {chapter.academicStanding.sgpa.map(({ semester, value }) => (
                        <li key={semester}>SGPA Sem {semester} {value}</li>
                      ))}
                    </ul>
                    <p>As of {chapter.academicStanding.asOf}</p>
                  </div>
                )}
                {chapter.links.length > 0 && <ul className="story-links">
                  {chapter.links.map(link => (
                    <li key={link.label}>
                      {"caseStudy" in link ? (
                        <a className="text-link" href="#work" aria-label={`${link.label} case study`}
                          onClick={event => {
                            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                            event.preventDefault();
                            trigger.current = event.currentTarget;
                            setCaseStudy(link.caseStudy);
                          }}>{link.label} <span aria-hidden="true">↗</span></a>
                      ) : (
                        <a className="text-link" href={link.href} aria-label={link.ariaLabel}
                          target="_blank" rel="noopener noreferrer">{link.label} <span aria-hidden="true">↗</span></a>
                      )}
                    </li>
                  ))}
                </ul>}
              </div>
            </li>
          ))}
        </ol>
      </div>
      <p className="story-closing mono">LEARNING THE SCIENCE. EXPLORING THE ART.</p>
      {caseStudy && <CaseStudyDialog slug={caseStudy} onClose={() => {
        setCaseStudy(null);
        trigger.current?.focus({ preventScroll: true });
      }} />}
    </>
  );
}
