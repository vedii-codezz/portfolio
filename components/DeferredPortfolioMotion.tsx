"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { fullMotionQuery } from "./motion-preference";

const PortfolioMotion = dynamic(() => import("./PortfolioMotion").then(module => module.PortfolioMotion), { ssr: false });

export function DeferredPortfolioMotion() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(fullMotionQuery);
    const portraitParallax = window.matchMedia("(min-width: 901px) and (hover: hover) and (pointer: fine)");
    const work = document.getElementById("work");
    let nearWork = false;
    let idle: number | undefined;
    const supportsIdleCallback = typeof window.requestIdleCallback === "function";
    const cancel = () => {
      if (idle === undefined) return;
      if (supportsIdleCallback) window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
    };
    const schedule = () => {
      cancel();
      if (!media.matches) {
        setEnabled(false);
        return;
      }
      if (work && !nearWork && !portraitParallax.matches) return;
      const enable = () => setEnabled(true);
      idle = supportsIdleCallback ? window.requestIdleCallback(enable, { timeout: 1200 }) : window.setTimeout(enable, 200);
    };
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      nearWork = true;
      observer.disconnect();
      schedule();
    }, { rootMargin: "200px 0px" });
    if (work) observer.observe(work);
    schedule();
    media.addEventListener("change", schedule);
    portraitParallax.addEventListener("change", schedule);
    return () => {
      cancel();
      observer.disconnect();
      media.removeEventListener("change", schedule);
      portraitParallax.removeEventListener("change", schedule);
    };
  }, []);

  return enabled ? <PortfolioMotion /> : null;
}
