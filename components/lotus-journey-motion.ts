import { fullMotionQuery } from "./motion-preference";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { journeyPoint } from "./journey-motion";

export function animateLotusJourney(rail: HTMLDivElement) {
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
}
