"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { fullMotionQuery } from "./motion-preference";

const PortfolioMotion = dynamic(() => import("./PortfolioMotion").then(module => module.PortfolioMotion), { ssr: false });

export function DeferredPortfolioMotion() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(fullMotionQuery);
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
      const enable = () => setEnabled(true);
      idle = supportsIdleCallback ? window.requestIdleCallback(enable, { timeout: 1200 }) : window.setTimeout(enable, 200);
    };
    schedule();
    media.addEventListener("change", schedule);
    return () => {
      cancel();
      media.removeEventListener("change", schedule);
    };
  }, []);

  return enabled ? <PortfolioMotion /> : null;
}
