"use client";

import dynamic from "next/dynamic";
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { gsap } from "gsap";
import type { StoryChapter } from "@/data/story";
import type { Project } from "@/data/projects";
import { fullMotionQuery } from "./motion-preference";
import { storyEntrance } from "./story-motion";

const CaseStudyDialog = dynamic(() => import("./CaseStudyDialog"), { ssr: false });

export function StoryChapters({ chapters, illustration, children }: {
  chapters: readonly StoryChapter[];
  illustration: ReactNode;
  children: ReactNode;
}) {
  const [step, setStep] = useState(0);
  const [caseStudy, setCaseStudy] = useState<Project["slug"] | null>(null);
  const timeline = useRef<HTMLOListElement>(null);
  const trigger = useRef<HTMLAnchorElement>(null);
  const current = step % chapters.length;
  const next = (current + 1) % chapters.length;

  useLayoutEffect(() => {
    const entry = timeline.current?.children[current];
    if (!step || !entry) return;
    const media = gsap.matchMedia();
    media.add(fullMotionQuery, () => {
      gsap.from(entry.querySelectorAll(".education-date, .education-content, .education-score"), storyEntrance);
    });
    return () => media.revert();
  }, [current, step]);

  return (
    <>
      <div className="story-journey">
        {illustration}
        <div className="story-chapters">
          {children}
          <ol className="education-timeline" id="story-timeline" ref={timeline} role="list">
            {chapters.map((chapter, index) => (
              <li className="education-entry" key={chapter.id} data-chapter={chapter.kind} data-active={index === current}>
                <div className="education-date mono">
                  <span className="timeline-dot" aria-hidden="true" />
                  <p>{chapter.period}</p>
                  {chapter.academicStanding && <span className="ongoing"><i /> {chapter.academicStanding.label}</span>}
                </div>
                <div className="education-content">
                  <span className="mono small-label">{chapter.kind.toUpperCase()} / CHAPTER {String(index + 1).padStart(2, "0")}</span>
                  <h3>{chapter.title}</h3>
                  {chapter.kind !== "education" && <p>{chapter.summary}</p>}
                  {chapter.details.map(detail => <p key={detail}>{detail}</p>)}
                  {chapter.kind === "education" && <span className="education-footnote mono">{chapter.summary}</span>}
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
                {chapter.academicStanding && (
                  <div className="education-score"><span className="mono">CGPA</span><strong>{chapter.academicStanding.cgpa}</strong><span className="mono">CURRENT ACADEMIC STANDING</span></div>
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>
      <div className="story-bottom mono">
        <span>LEARNING THE SCIENCE. EXPLORING THE ART.</span>
        {chapters.length > 1 && (
          <div className="story-pagination">
            <span aria-live="polite" aria-atomic="true"><span className="sr-only">Chapter {chapters[current].title}, </span>{current + 1} / {chapters.length}</span>
            <button type="button" aria-controls="story-timeline" aria-label={`Continued to ${chapters[next].title}`}
              onClick={() => setStep(previous => previous + 1)}>CONTINUED <span aria-hidden="true">→</span></button>
          </div>
        )}
      </div>
      {caseStudy && <CaseStudyDialog slug={caseStudy} onClose={() => {
        setCaseStudy(null);
        trigger.current?.focus({ preventScroll: true });
      }} />}
    </>
  );
}
