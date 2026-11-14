"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { fullMotionQuery } from "./motion-preference";
import { lotusEase } from "./lotus-ease";

export function SelectedWorkMotion() {
  useEffect(() => {
    const showcase = document.querySelector<HTMLElement>(".work-showcase");
    const rows = showcase?.querySelector<HTMLElement>(".work-rows");
    if (!showcase || !rows) return;

    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia(showcase);
    media.add(`(width >= 1024px) and ${fullMotionQuery}`, () => {
      showcase.dataset.parallax = "";
      function layerHint(element: HTMLElement, property: string) {
        return (self: ScrollTrigger) => {
          element.style.willChange = self.isActive ? property : "";
        };
      }

      const hint = layerHint(rows, "transform, opacity");
      gsap.fromTo(rows, { rotationX: 9, rotationZ: 9, y: -48, opacity: .3 }, {
        rotationX: 0, rotationZ: 0, y: 0, opacity: 1, ease: lotusEase,
        scrollTrigger: {
          trigger: showcase, start: "top bottom", end: "top center", scrub: true,
          onToggle: hint, onRefresh: hint,
        },
      });

      const lanes = showcase.querySelectorAll<HTMLElement>(".work-lane");
      lanes.forEach((lane, index) => {
        const track = lane.firstElementChild as HTMLElement;
        const distance = () => -Math.max(0, track.scrollWidth - lane.clientWidth);
        const hint = layerHint(track, "transform");
        gsap.fromTo(track, { x: index === 0 ? distance : 0 }, {
          x: index === 0 ? 0 : distance, ease: lotusEase,
          scrollTrigger: {
            trigger: lane, start: "top bottom", end: "bottom top", scrub: true,
            invalidateOnRefresh: true, onToggle: hint, onRefresh: hint,
          },
        });
      });

      // Native scrolling exposes focused cards while the scroll-linked transforms are suspended.
      function resetLane(event: FocusEvent) {
        if (event.relatedTarget instanceof HTMLElement && showcase?.contains(event.relatedTarget)) return;
        lanes.forEach(lane => { lane.scrollLeft = 0; });
      }
      showcase.addEventListener("focusout", resetLane);
      return () => {
        delete showcase.dataset.parallax;
        rows.style.willChange = "";
        lanes.forEach(lane => {
          (lane.firstElementChild as HTMLElement).style.willChange = "";
          lane.scrollLeft = 0;
        });
        showcase.removeEventListener("focusout", resetLane);
      };
    });

    media.add(`(width < 1024px) and ${fullMotionQuery}`, () => {
      gsap.utils.toArray<HTMLElement>(".work-lane:not(.work-lane-detail) .work-card", showcase)
        .filter(card => card.getBoundingClientRect().top > window.innerHeight)
        .forEach(card => {
          gsap.from(card, {
            y: 18, opacity: 0, duration: .45, ease: lotusEase, clearProps: "transform,opacity",
            scrollTrigger: { trigger: card, start: "top 95%", once: true },
          });
        });
    });

    return () => media.revert();
  }, []);
  return null;
}
