"use client";

import Image from "next/image";
import { useLayoutEffect, useRef } from "react";
import { caseStudies, type CaseStudy } from "@/data/case-studies";
import styles from "./case-study-dialog.module.css";

export default function CaseStudyDialog({ slug, onClose }: { slug: CaseStudy["slug"]; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const lastLink = useRef<HTMLAnchorElement>(null);
  const study = caseStudies.find(project => project.slug === slug);

  useLayoutEffect(() => {
    const element = dialog.current;
    if (!element) return;
    element.showModal();
    closeButton.current?.focus();
    return () => { element.close(); };
  }, []);

  if (!study) return null;

  return (
    <dialog ref={dialog} className={styles.dialog} aria-labelledby="case-study-title"
      onClose={event => { if (!event.currentTarget.open) onClose(); }}
      onKeyDown={event => {
        if (event.key !== "Tab") return;
        if (event.shiftKey && event.target === closeButton.current) {
          event.preventDefault();
          lastLink.current?.focus();
        } else if (!event.shiftKey && event.target === lastLink.current) {
          event.preventDefault();
          closeButton.current?.focus();
        }
      }}>
      <article className={styles.content}>
        <header>
          <div className={styles.top}>
            <span className="mono">{study.number} / CASE STUDY</span>
            <button ref={closeButton} type="button" onClick={() => dialog.current?.close()}>Close <span aria-hidden="true">×</span></button>
          </div>
          <h2 id="case-study-title">{study.name}</h2>
          <p className={styles.tagline}>{study.tagline}</p>
          <p className={styles.meta}>{study.kind === "Team" ? "Team project" : study.kind} · {study.month ? `${study.month} ` : ""}{study.year} · {study.accolade ?? study.role}</p>
        </header>
        <section aria-labelledby="case-study-problem">
          <h3 id="case-study-problem">Problem</h3>
          <p>{study.problem}</p>
        </section>
        <section aria-labelledby="case-study-project">
          <h3 id="case-study-project">{study.kind === "Solo" ? "What I Built" : "The Project"}</h3>
          {study.project.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
        </section>
        {study.media.length > 0 && (
          <section aria-labelledby="case-study-gallery">
            <h3 id="case-study-gallery">Gallery</h3>
            <div className={styles.gallery}>
              {study.media.map(({ src, alt, width, height, kind }) => kind === "image"
                ? <Image key={src} src={src} alt={alt} width={width} height={height} unoptimized />
                : <video key={src} src={src} aria-label={alt} width={width} height={height} controls preload="none" />)}
            </div>
          </section>
        )}
        <section aria-labelledby="case-study-contribution">
          <h3 id="case-study-contribution">My Contribution</h3>
          <ul>{study.contributions.map(contribution => <li key={contribution}>{contribution}</li>)}</ul>
          {study.contributionNote && <p>{study.contributionNote}</p>}
        </section>
        <section aria-labelledby="case-study-stack">
          <h3 id="case-study-stack">Stack</h3>
          <ul className={styles.stack}>{study.stack.map(tool => <li key={tool}>{tool}</li>)}</ul>
          {study.stackNote && <p>{study.stackNote}</p>}
        </section>
        <section aria-labelledby="case-study-result">
          <h3 id="case-study-result">Result / What I Learned</h3>
          <p>{study.result}</p>
        </section>
        <section aria-labelledby="case-study-links">
          <h3 id="case-study-links">Links</h3>
          <div className={styles.links}>
            <a href={study.links.demo} target="_blank" rel="noopener noreferrer" aria-label="Live Demo (opens in new tab)">Live Demo ↗</a>
            <a ref={lastLink} href={study.links.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub Source (opens in new tab)">GitHub Source ↗</a>
          </div>
        </section>
      </article>
    </dialog>
  );
}
