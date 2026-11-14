"use client";

import { reducedMotionQuery } from "./motion-preference";

import { useEffect, useRef, useLayoutEffect, type CSSProperties, type ReactNode } from "react";
import { angularFocus, advanceRing, bendTiles, clamp, nearestProject, releaseTarget, ringRadius, wrapDegrees, type RingMotion } from "./carousel-geometry";

export type CircularCarouselItem = { id: string; title: string; artwork: ReactNode };
type Props = {
  items: readonly CircularCarouselItem[];
  selectedIndex: number;
  onChange: (index: number) => void;
  onPreview: (index: number | null) => void;
  cardWidth?: number; gap?: number; perspective?: number; momentum?: number;
  depthFade?: number; cornerRadius?: number; curve?: number; tilt?: number;
  parallax?: number; stretch?: number; innerShade?: number; intro?: "rise" | "none";
};
type Press = { id: number; x: number; y: number; origin: number; angle: number; moved: boolean; samples: { angle: number; time: number }[] };

// The cylinder loops by rotation. Three strips approximate each curved face
// while keeping a single interactive wrapper per project.
export default function CircularCarousel({ items, selectedIndex, onChange, onPreview, cardWidth = 270, gap = 58, perspective = 2500, momentum = .6, depthFade = .35, cornerRadius = 12, curve = 1, tilt = -5, parallax = .3, stretch = .5, innerShade = .3, intro = "rise" }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const camera = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLDivElement | null)[]>([]);
  const controller = useRef<{ focus: (index: number) => void; step: (delta: number) => void; refresh: () => void } | null>(null);
  const active = selectedIndex;
  const callbacks = useRef({ onChange, onPreview });
  useLayoutEffect(() => { callbacks.current = { onChange, onPreview }; });
  const preview = useRef<number | null>(null);
  const dragging = useRef(false);
  const previewItem = (index: number | null) => {
    if (dragging.current) return;
    preview.current = index;
    callbacks.current.onPreview(index);
    controller.current?.refresh();
  };
  const count = items.length;
  const tileCount = curve > .001 ? 3 : 1;

  useEffect(() => {
    const shell = root.current, surface = stage.current, view = camera.current, cylinder = ring.current;
    if (!shell || !surface || !view || !cylinder || !count) return;
    const media = matchMedia(reducedMotionQuery);
    const motion: RingMotion = { angle: 0, velocity: 0, target: null };
    let press: Press | null = null;
    let raf = 0, last = 0, wheelTimer = 0;
    let visible = false, suppressClick = false, current = 0;
    let width = cardWidth, radius = ringRadius(count, width, gap, curve);
    let reduced = media.matches, introStart: number | null = null, introDone = intro === "none" || reduced;
    let yaw = 0, pitch = 0, aimX = 0, aimY = 0;
    const step = 360 / count;
    const rad = Math.PI / 180;
    const setActiveIndex = (index: number) => { if (index !== current) { current = index; callbacks.current.onChange(index); } };
    const render = (now: number) => {
      const swell = reduced ? 1 : 1 + stretch * .12 * Math.min(1, Math.abs(motion.velocity) / 420);
      const r = radius * swell;
      const angleX = reduced ? 0 : (width <= 260 ? tilt * .5 : tilt) + pitch;
      view.style.transform = reduced ? "none" : `translate3d(0,${r * Math.sin(angleX * rad)}px,${-r}px) rotateX(${angleX}deg) rotateY(${yaw}deg)`;
      cylinder.style.transform = reduced ? "none" : `rotateY(${motion.angle}deg)`;
      cards.current.forEach((card, index) => {
        if (!card) return;
        const world = wrapDegrees(index * step + motion.angle);
        let lift = 0;
        if (!introDone && introStart !== null) {
          const delay = Math.abs(world) / 180 * 480;
          const progress = clamp((now - introStart - delay) / 900, 0, 1);
          lift = Math.pow(1 - progress, 5) * (surface.clientHeight + 100);
        }
        card.style.transform = reduced
          ? `translate3d(${index === current ? 0 : Math.sign(world || 1) * (width + gap)}px,0,0)`
          : `rotateY(${index * step}deg) translateZ(${r}px) translateY(${lift}px)`;
        card.style.visibility = reduced && index !== current ? "hidden" : "visible";
        card.style.setProperty("--card-depth", String(reduced ? 0 : depthFade * Math.pow((1 - Math.cos(world * rad)) / 2, 1.25)));
        const treatment = angularFocus(world, preview.current === index);
        card.style.setProperty("--focus-blur", `${reduced ? 0 : treatment.blur}px`);
        card.style.setProperty("--focus-opacity", String(reduced ? 1 : treatment.opacity));
        card.style.pointerEvents = !reduced && Math.abs(world) > 100 ? "none" : "auto";
        card.tabIndex = index === current ? 0 : -1;
        card.dataset.worldAngle = String(world);
      });
      if (!press?.moved && motion.target === null && Math.abs(motion.velocity) < .03) setActiveIndex(nearestProject(motion.angle, count));
    };
    const measure = () => {
      width = cards.current[0]?.offsetWidth || cardWidth;
      radius = ringRadius(count, width, gap, curve);
      reduced = media.matches;
      const geometry = bendTiles(width, radius, reduced ? 0 : curve, tileCount);
      const chord = reduced || !curve ? width : 2 * (radius / curve) * Math.sin(width / (2 * radius / curve));
      shell.style.setProperty("--carousel-chord", `${chord}px`);
      shell.style.setProperty("--carousel-measured-width", `${width}px`);
      shell.dataset.reducedMotion = String(reduced);
      cards.current.forEach(card => {
        if (!card) return;
        card.querySelectorAll<HTMLElement>("[data-art-tile]").forEach((tile, index) => {
          // Reduced motion keeps one complete decorative artwork, with no bend.
          const back = tile.dataset.back === "true";
          const part = geometry[index % tileCount];
          if (!part || (reduced && (index % tileCount !== 0 || back))) { tile.style.display = "none"; return; }
          tile.style.display = "block";
          tile.style.width = `${part.size}px`;
          tile.style.marginLeft = `${-part.size / 2}px`;
          tile.style.transform = `translate3d(${part.x}px,0,${part.z}px) rotateY(${part.angle + (back ? 180 : 0)}deg)`;
          const image = tile.querySelector<HTMLElement>(".carousel-tile-art");
          if (image) image.style.left = `${-(back ? width - part.end : part.start)}px`;
        });
      });
      if (reduced) { introDone = true; motion.angle = Math.round(motion.angle / step) * step; motion.velocity = 0; motion.target = null; setActiveIndex(nearestProject(motion.angle, count)); }
      render(performance.now());
    };
    const frame = (now: number) => {
      raf = 0;
      const dt = last ? Math.min(.05, (now - last) / 1000) : 1 / 60;
      last = now;
      if (!introDone) {
        introStart ??= now;
        if (now - introStart >= 1400) introDone = true;
      }
      if (!press?.moved && introDone) Object.assign(motion, advanceRing(motion, dt, momentum));
      const ease = 1 - Math.exp(-dt / .35);
      const nextYaw = reduced ? 0 : aimX * parallax * 9;
      const nextPitch = reduced ? 0 : -aimY * parallax * 6;
      yaw += (nextYaw - yaw) * ease; pitch += (nextPitch - pitch) * ease;
      render(now);
      const busy = !introDone || motion.target !== null || Math.abs(motion.velocity) > .01 || Math.abs(nextYaw - yaw) > .01 || Math.abs(nextPitch - pitch) > .01;
      if (busy && visible && !document.hidden) raf = requestAnimationFrame(frame);
      else { last = 0; shell.dataset.motion = "idle"; }
    };
    const wake = () => {
      if (raf || !visible || document.hidden || document.documentElement.dataset.lotusLoading === "pending") return;
      shell.dataset.motion = "running";
      raf = requestAnimationFrame(frame);
    };
    const commit = (index: number) => {
      preview.current = null; callbacks.current.onPreview(null);
      setActiveIndex(index);
    };
    const focus = (index: number) => {
      introDone = true;
      commit(index);
      const base = -index * step;
      motion.target = base + 360 * Math.round((motion.angle - base) / 360);
      if (reduced) { motion.angle = motion.target; motion.target = null; motion.velocity = 0; setActiveIndex(nearestProject(motion.angle, count)); render(performance.now()); }
      wake();
    };
    const stepBy = (delta: number) => {
      introDone = true;
      motion.target = (motion.target ?? Math.round(motion.angle / step) * step) - delta * step;
      commit(nearestProject(motion.target, count));
      if (reduced) { motion.angle = motion.target; motion.target = null; motion.velocity = 0; setActiveIndex(nearestProject(motion.angle, count)); render(performance.now()); }
      wake();
    };
    controller.current = { focus, step: stepBy, refresh: () => render(performance.now()) };
    const finishPress = (cancelled = false) => {
      const gesture = press;
      press = null;
      delete shell.dataset.dragging;
      dragging.current = false;
      if (!gesture?.moved) return;
      suppressClick = true;
      const first = gesture.samples[0], end = gesture.samples[gesture.samples.length - 1];
      const seconds = (end.time - first.time) / 1000;
      motion.velocity = cancelled || performance.now() - end.time > 110 || seconds < .008 ? 0 : clamp((end.angle - first.angle) / seconds, -1400, 1400);
      motion.target = cancelled ? Math.round(motion.angle / step) * step : releaseTarget(motion.angle, motion.velocity, step, momentum);
      if (reduced) { motion.angle = motion.target; motion.velocity = 0; motion.target = null; setActiveIndex(nearestProject(motion.angle, count)); render(performance.now()); }
      wake();
    };
    const down = (event: PointerEvent) => {
      suppressClick = false;
      if (event.button !== 0 || press || (event.target as Element).closest("a,button")) return;
      introDone = true;
      // Keep an existing snap alive until this press becomes a horizontal drag.
      press = { id: event.pointerId, x: event.clientX, y: event.clientY, origin: 0, angle: motion.angle, moved: false, samples: [{ angle: motion.angle, time: performance.now() }] };
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType === "mouse") {
        const bounds = surface.getBoundingClientRect();
        aimX = clamp((event.clientX - bounds.left) / bounds.width * 2 - 1, -1, 1);
        aimY = clamp((event.clientY - bounds.top) / bounds.height * 2 - 1, -1, 1);
      }
      if (!press || press.id !== event.pointerId) { wake(); return; }
      const dx = event.clientX - press.x, dy = event.clientY - press.y;
      if (!press.moved) {
        if (Math.abs(dy) > Math.abs(dx) * 1.2 && Math.abs(dy) > 5) { press = null; wake(); return; }
        if (Math.abs(dx) < 5) return;
        press.moved = true;
        dragging.current = true; preview.current = null; callbacks.current.onPreview(null);
        press.angle = motion.angle; press.origin = dx;
        press.samples = [{ angle: motion.angle, time: performance.now() }];
        motion.target = null; motion.velocity = 0;
        shell.dataset.dragging = "true";
        surface.setPointerCapture(event.pointerId);
      }
      motion.angle = press.angle + (dx - press.origin) * 180 / (Math.PI * radius);
      const now = performance.now();
      press.samples.push({ angle: motion.angle, time: now });
      while (press.samples.length > 2 && now - press.samples[0].time > 110) press.samples.shift();
      render(now); wake();
    };
    const up = (event: PointerEvent) => {
      if (press?.id !== event.pointerId) return;
      finishPress(event.type === "pointercancel");
      if (surface.hasPointerCapture(event.pointerId)) surface.releasePointerCapture(event.pointerId);
    };
    const lost = (event: PointerEvent) => { if (event.target === surface && press?.moved) finishPress(true); };
    const leave = () => { aimX = 0; aimY = 0; if (press && !press.moved) press = null; wake(); };
    const click = (event: MouseEvent) => {
      if (suppressClick && event.detail > 0) { event.preventDefault(); event.stopPropagation(); }
      suppressClick = false;
    };
    const wheel = (event: WheelEvent) => {
      if (event.ctrlKey || Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
      event.preventDefault();
      introDone = true; preview.current = null; callbacks.current.onPreview(null);
      const delta = event.deltaX * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? surface.clientWidth : 1);
      motion.target = null;
      motion.angle -= delta * 180 / (Math.PI * radius);
      motion.velocity = reduced ? 0 : -delta * 180 / (Math.PI * radius) * 30;
      render(performance.now());
      clearTimeout(wheelTimer);
      wheelTimer = window.setTimeout(() => {
        motion.target = releaseTarget(motion.angle, motion.velocity, step, momentum);
        if (reduced) { motion.angle = motion.target; motion.target = null; setActiveIndex(nearestProject(motion.angle, count)); render(performance.now()); }
        wake();
      }, 140);
      wake();
    };
    const pause = () => { cancelAnimationFrame(raf); raf = 0; last = 0; shell.dataset.motion = "paused"; };
    const visibility = () => { if (document.hidden) pause(); else wake(); };
    const resize = new ResizeObserver(() => { measure(); wake(); });
    const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) wake(); else pause(); }, { threshold: .05 });
    const onMotion = () => { aimX = 0; aimY = 0; yaw = 0; pitch = 0; measure(); wake(); };
    surface.addEventListener("pointerdown", down);
    surface.addEventListener("pointermove", move);
    surface.addEventListener("pointerup", up);
    surface.addEventListener("pointercancel", up);
    surface.addEventListener("lostpointercapture", lost);
    surface.addEventListener("pointerleave", leave);
    surface.addEventListener("click", click, true);
    surface.addEventListener("wheel", wheel, { passive: false });
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("portfolio:reveal", wake);
    window.addEventListener("portfolio:ready", wake);
    media.addEventListener("change", onMotion);
    resize.observe(shell); intersection.observe(surface); measure();
    shell.dataset.ringReady = "true";
    return () => {
      if (press && surface.hasPointerCapture(press.id)) surface.releasePointerCapture(press.id);
      dragging.current = false;
      pause(); clearTimeout(wheelTimer); resize.disconnect(); intersection.disconnect(); controller.current = null;
      surface.removeEventListener("pointerdown", down); surface.removeEventListener("pointermove", move);
      surface.removeEventListener("pointerup", up); surface.removeEventListener("pointercancel", up);
      surface.removeEventListener("lostpointercapture", lost); surface.removeEventListener("pointerleave", leave);
      surface.removeEventListener("click", click, true); surface.removeEventListener("wheel", wheel);
      document.removeEventListener("visibilitychange", visibility); window.removeEventListener("portfolio:reveal", wake); window.removeEventListener("portfolio:ready", wake);
      media.removeEventListener("change", onMotion);
    };
  }, [cardWidth, gap, momentum, depthFade, curve, tilt, parallax, stretch, intro, count, tileCount]);

  return <div ref={root} className="circular-carousel" role="region" aria-roledescription="carousel" aria-label="Selected projects"
    style={{ "--carousel-width": `${cardWidth}px`, "--carousel-perspective": `${perspective}px`, "--carousel-radius": `${cornerRadius}px`, "--carousel-inner": innerShade } as CSSProperties}
    onKeyDown={event => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
        if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
          event.preventDefault();
          if (event.target instanceof HTMLElement && event.target.matches(".carousel-card")) {
            stage.current?.focus({ preventScroll: true });
          }
          if (event.key === "Home" || event.key === "End") controller.current?.focus(event.key === "Home" ? 0 : count - 1);
          else controller.current?.step(event.key === "ArrowRight" ? 1 : -1);
        }
      }}>
    <p className="carousel-instruction" id="carousel-help">Drag to explore · or use the arrows</p>
    <div ref={stage} className="carousel-stage" tabIndex={0} aria-label="Project gallery" aria-describedby="carousel-help">
      <div ref={camera} className="carousel-camera"><div ref={ring} className="carousel-cylinder">
        {items.map((item, index) => <div key={item.id} ref={element => { cards.current[index] = element; }}
          className="carousel-card" data-active={index === active} data-project={item.id} role="button" tabIndex={index === active ? 0 : -1} aria-pressed={index === active}
          aria-label={`${index + 1} of ${count}: ${item.title}`}
          onPointerEnter={event => { if (event.pointerType === "mouse") previewItem(index); }}
          onPointerLeave={event => { if (event.pointerType === "mouse" && preview.current === index) previewItem(null); }}
          onFocus={() => previewItem(index)} onBlur={() => previewItem(null)}
          onKeyDown={event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); controller.current?.focus(index); } }}
          onClick={() => controller.current?.focus(index)}>
          <div className="carousel-tiled-surface" aria-hidden="true" inert>
            {Array.from({ length: tileCount }, (_, tile) => <div className="carousel-art-tile" data-art-tile key={tile} data-edge={tile === 0 ? "first" : tile === tileCount - 1 ? "last" : undefined}>
              <div className="carousel-tile-frame"><div className="carousel-tile-art">{item.artwork}</div><div className="carousel-tile-shade" /></div>
            </div>)}
            {Array.from({ length: tileCount }, (_, tile) => <div className="carousel-art-tile carousel-art-back" data-art-tile data-back="true" key={`back-${tile}`} data-edge={tile === 0 ? "last" : tile === tileCount - 1 ? "first" : undefined}>
              <div className="carousel-tile-frame"><div className={`carousel-tile-art visual-${item.id}`} /><div className="carousel-tile-shade" /></div>
            </div>)}
          </div>

        </div>)}
      </div></div>
    </div>
    <div className="carousel-controls">
      <button type="button" aria-label="Previous project" onClick={() => controller.current?.step(-1)}>←</button>
      <div className="carousel-dots">{items.map((item, index) => <button type="button" key={item.id} aria-label={`Show ${item.title}`} aria-current={index === active ? "true" : undefined} onClick={() => controller.current?.focus(index)}><span /></button>)}</div>
      <button type="button" aria-label="Next project" onClick={() => controller.current?.step(1)}>→</button>
    </div>
    <span className="carousel-sr" role="status" aria-live="polite" aria-atomic="true">Project {active + 1} of {count}: {items[active]?.title}</span>
  </div>;
}
