"use client";

import { lotusEase } from "./lotus-ease";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { LoaderPetals, lotusPetals } from "./LoaderPetals";
import { completeLotus, lockPortfolio, shouldPlayLotus } from "./lotus-lifecycle";
import { heroEntrance } from "./hero-entrance";
import { FloralCoverage } from "./FloralCoverage";
import { floralCoverage, floralPose } from "./floral-coverage";
import { observeLoaderViewport, readLoaderViewport } from "./loader-viewport";
import { reducedMotionQuery } from "./motion-preference";
import "./loader-lotus.css";

export function LoaderLotus() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [finished, setFinished] = useState(false);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    const restore = (event: PageTransitionEvent) => {
      if (!event.persisted || window.matchMedia(reducedMotionQuery).matches) return;
      delete document.documentElement.dataset.lotusRecovery;
      document.documentElement.dataset.lotusLoading = "pending";
      setFinished(false);
      setCycle(value => value + 1);
    };
    window.addEventListener("pageshow", restore);
    return () => window.removeEventListener("pageshow", restore);
  }, []);

  useEffect(() => {
    const overlay = overlayRef.current;
    const content = document.getElementById("portfolio-content");
    const root = document.documentElement;
    if (!overlay || !content) return;
    let disposed = false;
    let completed = false;
    let context: gsap.Context | undefined;
    let stopViewport = () => {};
    let viewport = readLoaderViewport(window);
    let renderGeometry = () => {};
    const release = lockPortfolio(content);
    const finish = () => {
      if (disposed || completed) return;
      completed = true;
      context?.revert();
      context = undefined;
      release();
      teardown();
      completeLotus();
      setFinished(true);
    };
    const reveal = () => {
      root.dataset.lotusLoading = "revealing";
      window.dispatchEvent(new Event("portfolio:reveal"));
    };
    const media = window.matchMedia(reducedMotionQuery);
    const started = Date.now();
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") finish(); };
    const onVisibility = () => { if (!document.hidden && Date.now() - started > 3900) finish(); };
    window.addEventListener("portfolio:ready", finish);
    window.addEventListener("keydown", onKey);
    document.addEventListener("visibilitychange", onVisibility);
    media.addEventListener("change", finish);
    const safety = window.setTimeout(finish, 4200);
    let skippedFrame = 0;
    const teardown = () => {
      window.clearTimeout(safety);
      stopViewport();
      ["--loader-width", "--loader-height", "--loader-left", "--loader-top"].forEach(property => overlay.style.removeProperty(property));
      cancelAnimationFrame(skippedFrame);
      window.removeEventListener("portfolio:ready", finish);
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("visibilitychange", onVisibility);
      media.removeEventListener("change", finish);
    };

    if (media.matches || !shouldPlayLotus()) {
      skippedFrame = requestAnimationFrame(finish);
    } else {
      // A fresh root-page intro reveals the hero, even if the browser restored
      // the previous document's scroll offset. Explicit section links retain intent.
      if (!window.location.hash) window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      try {
        context = gsap.context(() => {
          stopViewport = observeLoaderViewport(window, next => {
            viewport = next;
            overlay.style.setProperty("--loader-width", `${next.width}px`);
            overlay.style.setProperty("--loader-height", `${next.height}px`);
            overlay.style.setProperty("--loader-left", `${next.left}px`);
            overlay.style.setProperty("--loader-top", `${next.top}px`);
            renderGeometry();
          });
          const petals = gsap.utils.toArray<HTMLElement>("[data-lotus-petal]", overlay);
          gsap.set(content.querySelectorAll("[data-portrait]"), { scale: 1.03, clipPath: "inset(4% 0% 0% 0%)" });
          gsap.set(petals, { xPercent: -50, yPercent: -100, transformOrigin: "50% 97%" });
          const timeline = gsap.timeline({ onComplete: finish });
          // Keep every stage of the bloom while revealing the portrait sooner
          // on phones, where it is the largest contentful paint candidate.
          if (window.matchMedia("(max-width: 767px) and (pointer: coarse)").matches) {
            timeline.timeScale(1.8);
          }

          petals.forEach((petal, i) => gsap.set(petal, {
            rotation: lotusPetals[i].angle * .13,
            rotationX: 7,
            scaleX: .48 * lotusPetals[i].size,
            scaleY: .83 * lotusPetals[i].size,
          }));
          timeline.to("[data-loader-lotus]", { opacity: 1, y: -3, duration: .65, ease: "sine.out" }, 0)
            .to("[data-lotus-aura]", { opacity: .75, scale: 1.15, duration: 1.5, ease: lotusEase }, .3);
          petals.forEach((petal, i) => {
            const shape = lotusPetals[i];
            timeline.to(petal, {
              rotation: shape.angle, rotationX: shape.tilt,
              scaleX: shape.size, scaleY: shape.size,
              duration: 1.25, ease: lotusEase,
            }, .35 + Math.floor(i / 7) * .12 + Math.abs(shape.angle) * .0015);
          });
          timeline.to("[data-loader-lotus]", { scale: 1.32, y: -12, duration: .85, ease: lotusEase }, 1.65)
            .to("[data-lotus-heart]", { opacity: .8, scale: 1.2, duration: .6 }, 1.5)
            .to("[data-lotus-aura], [data-lotus-heart]", { opacity: 0, duration: .32 }, 2.28);

          // Carry the bloom into broad overlapping surfaces, then pass beyond them.
          const panels = Array.from(overlay.querySelectorAll<HTMLElement>("[data-floral-panel]"));
          let dimensions = floralCoverage(viewport.width, viewport.height);
          let radius = Math.hypot(viewport.width, viewport.height) * .8;
          const coverage = panels.map(() => ({ expansion: .035, exit: 0 }));
          const foregroundMotion = petals.map(() => ({ x: 0, y: 0 }));
          const setters = panels.map(panel => ({ x: gsap.quickSetter(panel, "x", "px"), y: gsap.quickSetter(panel, "y", "px"), scaleX: gsap.quickSetter(panel, "scaleX"), scaleY: gsap.quickSetter(panel, "scaleY"), rotation: gsap.quickSetter(panel, "rotation", "deg") }));
          const foregroundSetters = petals.map(petal => ({ x: gsap.quickSetter(petal, "x", "px"), y: gsap.quickSetter(petal, "y", "px") }));
          const renderPanel = (i: number) => {
            const pose = floralPose(dimensions, i, coverage[i].expansion, coverage[i].exit);
            setters[i].x(pose.x); setters[i].y(pose.y); setters[i].scaleX(pose.scale); setters[i].scaleY(pose.scale); setters[i].rotation(pose.rotation);
          };
          const renderForeground = (i: number) => {
            foregroundSetters[i].x(foregroundMotion[i].x * radius);
            foregroundSetters[i].y(foregroundMotion[i].y * radius);
          };
          renderGeometry = () => {
            dimensions = floralCoverage(viewport.width, viewport.height);
            radius = Math.hypot(viewport.width, viewport.height) * .8;
            panels.forEach((panel, i) => {
              gsap.set(panel, { width: dimensions.radius * 3, height: dimensions.radius * 2.4, xPercent: -50, yPercent: -87.5, transformOrigin: "50% 87.5%" });
              renderPanel(i);
            });
            petals.forEach((_, i) => renderForeground(i));
          };
          renderGeometry();
          gsap.set(panels, { opacity: 0 });
          panels.forEach((panel, i) => {
            const delay = [0, .035, .012, .055, .025, .065, .018, .045][i];
            timeline.to(panel, { opacity: 1, duration: .3, ease: lotusEase }, 1.94 + delay)
              .to(coverage[i], { expansion: 1, duration: .68, ease: lotusEase, onUpdate: () => renderPanel(i) }, 1.94 + delay)
              // The camera keeps approaching while the layers begin to part.
              .to(coverage[i], { expansion: 1.06, duration: .7, ease: "sine.out", onUpdate: () => renderPanel(i) }, 2.62 + delay)
              .to(coverage[i], { exit: 1, duration: .92, ease: lotusEase, onUpdate: () => renderPanel(i) }, 2.66 + delay);
          });
          timeline.to("[data-floral-underlay]", { opacity: 1, duration: .2, ease: lotusEase }, 2.4)
            .to("[data-floral-underlay]", { opacity: 0, duration: .44, ease: lotusEase }, 2.7);
          petals.forEach((petal, i) => {
            const shape = lotusPetals[i];
            const angle = shape.angle * Math.PI / 180;
            const at = 2.16 + (i % 3) * .028;
            // Keep the original bloom orientation; avoid re-fanning into a pinwheel.
            timeline.to(petal, { scaleX: shape.size * 2.65, scaleY: shape.size * 2.65,
              rotationX: 0, duration: .72, ease: lotusEase }, at)
              .to(petal, { opacity: 0, duration: .3, ease: lotusEase }, 2.55 + (i % 3) * .025);
            timeline.to(foregroundMotion[i], { x: Math.sin(angle) * .35, y: -Math.cos(angle) * .35,
              duration: .8, ease: lotusEase, onUpdate: () => renderForeground(i) }, at);
          });
          timeline.call(reveal, [], 2.58)
            .to("[data-loader-backdrop]", { opacity: 0, duration: .24, ease: lotusEase }, 2.56)
            .to("[data-loader-veil]", { opacity: 0, duration: .24, ease: lotusEase }, 2.58)
            .add(heroEntrance(content, false).timeScale(1.25), 3.02)
            .to(overlay, { opacity: 0, duration: .1 }, 3.7);
        }, overlay);
      } catch {
        // Content takes priority if animation setup fails.
        skippedFrame = requestAnimationFrame(finish);
      }
    }

    return () => {
      disposed = true;
      teardown();
      context?.revert();
      release();
    };
  }, [cycle]);

  if (finished) return null;
  return <div ref={overlayRef} className="lotus-loader" aria-hidden="true">
    <div className="loader-theme-veil" data-loader-veil />
    <div className="loader-backdrop" data-loader-backdrop />
    <LoaderPetals />
    <FloralCoverage />
  </div>;
}
