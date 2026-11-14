"use client";

import Image from "next/image";
import { useSyncExternalStore } from "react";
import { TextScramble } from "@/components/core/text-scramble";
import portrait from "@/public/images/bedantika.jpeg";

function subscribeToEntrance(callback: () => void) {
  window.addEventListener("portfolio:ready", callback);
  return () => window.removeEventListener("portfolio:ready", callback);
}
const entranceFinished = () => document.documentElement.dataset.lotusLoading === "complete";
const serverEntranceFinished = () => false;

export function Hero() {
  const ready = useSyncExternalStore(subscribeToEntrance, entranceFinished, serverEntranceFinished);
  return (
    <section className="hero" id="home" aria-labelledby="hero-name">
      <div className="hero-topline mono"><span>PERSONAL PORTFOLIO / CREATIVE LAB</span><span className="hero-discipline"><i /> AI / ML & CREATIVE DEVELOPMENT</span></div>
      <div className="hero-composition">
        <div className="hero-copy">
          <p className="hero-greeting" data-hero-reveal>Hey, I&apos;m Bedantika.</p>
          <h1 id="hero-name" aria-label="Bedantika Mondal">
            <span aria-hidden="true" className="headline-mask"><span data-headline><TextScramble as="span" speed={0.05} trigger={ready ? undefined : false}>Bedantika</TextScramble></span></span>
            <span aria-hidden="true" className="headline-mask surname"><span data-headline><TextScramble as="span" speed={0.05} trigger={ready ? undefined : false}>Mondal</TextScramble><span className="name-period">.</span></span></span>
          </h1>
          <div className="hero-intro">
            <span className="tiny-cross" aria-hidden="true">✳</span>
            <div><h2 data-hero-reveal>Built to think.<br /><em>Made to feel.</em></h2>
              <p data-hero-reveal>I explore the intersection of artificial intelligence and creative technology, building intelligent systems and expressive digital experiences.</p>
              <a className="text-link" href="#work" data-hero-reveal>Explore my work <span aria-hidden="true">↗</span></a>
            </div>
          </div>
        </div>
        <figure className="hero-portrait">
          <div className="portrait-orbit" aria-hidden="true" />
          <span className="portrait-side mono" aria-hidden="true">A CURIOUS MIND. A CREATIVE SOUL.</span>
          <div className="portrait-frame" data-portrait>
            <Image src={portrait} alt="Bedantika Mondal wearing a red sari" fill preload placeholder="blur" sizes="(max-width: 600px) 85vw, (max-width: 900px) 46vw, 38vw" className="portrait-image" />
            <span className="portrait-corner" aria-hidden="true">B / M</span>
          </div>
          <figcaption className="mono"><span>01 — THE PERSON BEHIND THE PIXELS</span><span aria-hidden="true">↗</span></figcaption>
          <div className="portrait-stamp" aria-hidden="true"><span>LOGIC</span><b>×</b><span>A LITTLE MAGIC</span></div>
        </figure>
      </div>
      <div className="hero-bottom mono"><a className="scroll-cue" href="#work"><span className="scroll-line" aria-hidden="true" />SCROLL TO DISCOVER <span aria-hidden="true">↓</span></a><span>THOUGHTFULLY ENGINEERED. PERSONALLY EXPRESSED.</span><span aria-hidden="true">[ KEEP EXPLORING ]</span></div>
    </section>
  );
}
