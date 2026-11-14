"use client";

import { fullMotionQuery } from "./motion-preference";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { journeyPoint } from "./journey-motion";

// Hand-drawn Bézier paths, ordered from the heart of the bloom outwards.
const petals = [
  "M140 310C96 273 91 229 140 176C189 229 184 273 140 310Z",
  "M140 310C112 273 110 244 140 207C170 244 168 273 140 310Z",
  "M140 310C123 291 125 273 140 253C155 273 157 291 140 310Z",
  "M140 310C95 299 57 276 49 230C91 231 115 248 140 310Z",
  "M140 310C185 299 223 276 231 230C189 231 165 248 140 310Z",
  "M140 310C99 278 57 270 20 286C57 321 95 329 140 310Z",
  "M140 310C181 278 223 270 260 286C223 321 185 329 140 310Z",
  "M140 310C109 304 84 315 68 337C103 326 112 351 140 310Z",
  "M140 310C171 304 196 315 212 337C177 326 168 351 140 310Z",
];
const leaves = [
  "M106 163C97 141 111 131 121 121C120 142 113 148 106 163Z",
  "M141 401C104 368 81 381 57 393C89 388 105 420 141 401Z",
  "M165 449C165 424 181 419 193 410C188 435 176 435 165 449Z",
  "M148 510C166 478 202 478 220 485C193 493 182 520 148 510Z",
  "M125 542C107 519 117 503 128 491C133 514 120 523 125 542Z",
  "M112 626C116 594 136 589 151 582C144 605 130 622 112 626Z",
];
const curls = [
  "M110 204C61 153 118 101 91 78C70 60 53 76 65 86",
  "M108 186C123 141 167 134 190 150C216 168 209 190 198 182",
  "M76 282C43 231 6 246 11 289C14 316 29 333 38 339",
  "M185 251C208 217 246 221 254 245C261 265 247 275 241 267",
  "M141 401C99 368 85 420 111 426C130 431 125 413 119 417",
  "M165 449C131 413 98 441 111 459C119 469 129 461 123 455",
  "M125 542C151 506 201 535 183 553C174 563 161 557 168 549",
  "M112 626C129 589 183 610 174 635C169 649 152 650 154 640",
];

const vinePath = "M140 310C146 336 98 350 125 387C162 431 191 449 160 495C135 534 91 558 109 605C120 635 159 663 140 714";

function JourneyArtwork({ variant }: { variant: "desktop" | "flower" | "vine" }) {
  const flower = variant !== "vine";
  const vine = variant !== "flower";
  return <svg className={`lotus-journey journey-${variant}`} viewBox={variant === "desktop" ? "0 165 280 635" : variant === "flower" ? "0 165 280 180" : "40 310 200 420"}
    preserveAspectRatio={variant === "vine" ? "none" : "xMidYMin meet"} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    {flower && <g className="journey-petals">{(variant === "flower" ? petals.slice(0, 7) : petals).map(d => <path key={d} data-draw="petal" d={d} />)}</g>}
    {vine && <>
      <path className="journey-primary" data-draw="vine" d={vinePath} />
      {variant === "desktop" && <g className="journey-curls">{curls.slice(2).map(d => <path key={d} data-draw="curl" d={d} />)}</g>}
      <g className="journey-leaves">{leaves.slice(1).map(d => <path key={d} data-draw="leaf" d={d} />)}</g>
      <g className="journey-dots" fill="currentColor" stroke="none">
        {[[52, 348], [93, 468], [192, 565], [109, 675]].map(([x, y]) => <circle key={y} data-dot="vine" cx={x} cy={y} r="1.6" />)}
      </g>
      {variant === "desktop" && <path data-draw="finish" d="M140 714C138 731 135 737 126 744C135 748 138 756 140 766C142 756 145 748 154 744C145 737 142 731 140 714Z" />}
      <g className="journey-traveler" opacity="0" transform="translate(140 310)"><path d="M0 -7C-6 -1-4 3 0 6C4 3 6 -1 0 -7ZM0 6C-7 6-9 2-9 -1C-4 -1-2 2 0 6C2 2 4 -1 9 -1C9 2 7 6 0 6Z" /></g>
    </>}
  </svg>;
}

export function LotusJourney() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const rail = ref.current;
    if (!rail) return;
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    const start = () => media.add({ compact: "(max-width:1199px)", motion: fullMotionQuery }, context => {
      if (!context.conditions?.motion) return;
      const svgs = Array.from(rail.querySelectorAll<SVGSVGElement>(context.conditions.compact ? ".journey-flower, .journey-vine" : ".journey-desktop"));
      const find = (selector: string) => svgs.flatMap(svg => Array.from(svg.querySelectorAll<SVGElement>(selector)));
      find("[data-draw]").forEach(node => {
        const path = node as SVGPathElement;
        const length = path.getTotalLength();
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: length, fillOpacity: 0 });
      });
      gsap.set(find("[data-dot]"), { opacity: 0 });
      const travel = { progress: 0 };
      const travelers = svgs.flatMap(svg => {
        const vine = svg.querySelector<SVGPathElement>('[data-draw="vine"]');
        const marker = svg.querySelector<SVGGElement>(".journey-traveler");
        if (!vine || !marker) return [];
        const length = vine.getTotalLength();
        const points = Array.from({ length: 201 }, (_, i) => {
          const point = vine.getPointAtLength(length * i / 200);
          return { x: point.x, y: point.y };
        });
        // Author the same origin in SSR and before any opacity/scroll animation.
        marker.setAttribute("transform", `translate(${points[0].x} ${points[0].y})`);
        gsap.set(marker, { opacity: 0 });
        return [{ marker, points }];
      });
      const positionMarkers = () => travelers.forEach(({ marker, points }) => {
        const p = journeyPoint(points, travel.progress);
        marker.setAttribute("transform", `translate(${p.x} ${p.y})`);
      });
      const timeline = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: {
        trigger: rail, start: () => `clamp(top ${Math.round(window.innerHeight * .84)}px)`,
        end: () => `clamp(bottom ${Math.round(Math.min(window.innerHeight * .3, 220))}px)`,
        scrub: .35, invalidateOnRefresh: true, onRefresh: positionMarkers,
      } });
      const draw = (selector: string, at: number, duration: number, stagger = 0) => {
        const targets = find(selector);
        if (targets.length) timeline.to(targets, { strokeDashoffset: 0, duration, stagger }, at);
      };
      draw('[data-draw="upper"]', .04, .32);
      draw('[data-draw="petal"]', .12, .34, .035);
      timeline.to(find('[data-draw="petal"]'), { fillOpacity: .26, duration: .3, stagger: .02 }, .4);
      draw('[data-draw="vine"]', .67, 1.1);
      draw('[data-draw="curl"]', .2, .28, .17);
      draw('[data-draw="leaf"]', .75, .25, .14);
      timeline.to(find('[data-draw="leaf"]'), { fillOpacity: .5, duration: .2, stagger: .14 }, .9);
      timeline.to(find('[data-dot="vine"]'), { opacity: 1, duration: .1, stagger: .15 }, .85);
      draw('[data-draw="finish"]', 1.78, .22);
      travelers.forEach(({ marker }) => {
        timeline.to(marker, { opacity: .85, duration: .1 }, .67);
        timeline.to(marker, { opacity: 0, duration: .15 }, 1.77);
      });
      timeline.to(travel, { progress: 1, duration: 1.1, onUpdate: positionMarkers }, .67);
      positionMarkers();
      let disposed = false;
      let refreshFrame = 0;
      const queueRefresh = () => {
        if (disposed || refreshFrame) return;
        refreshFrame = requestAnimationFrame(() => { refreshFrame = 0; if (!disposed) ScrollTrigger.refresh(); });
      };
      const observer = new ResizeObserver(queueRefresh);
      observer.observe(rail);
      void document.fonts.ready.then(queueRefresh);
      return () => { disposed = true; observer.disconnect(); cancelAnimationFrame(refreshFrame); };
    }, rail);
    let started = false;
    let frame = 0;
    const startOnce = () => {
      if (started) return;
      started = true;
      frame = requestAnimationFrame(start);
    };
    if (document.documentElement.dataset.lotusLoading !== "pending") startOnce();
    window.addEventListener("portfolio:reveal", startOnce);
    window.addEventListener("portfolio:ready", startOnce);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("portfolio:reveal", startOnce);
      window.removeEventListener("portfolio:ready", startOnce);
      media.revert();
    };
  }, []);
  return <div ref={ref} className="journey-rail" aria-hidden="true">
    <JourneyArtwork variant="desktop" />
    <JourneyArtwork variant="flower" />
    <JourneyArtwork variant="vine" />
  </div>;
}
