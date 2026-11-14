import { gsap } from "gsap";

// Attached to the lotus master timeline; no second entrance clock or timer.
export function heroEntrance(content: HTMLElement, reduced: boolean) {
  const timeline = gsap.timeline();
  if (reduced) return timeline;
  const find = (selector: string) => content.querySelectorAll(selector);
  return timeline
    .from(find("[data-portrait]"), { scale: 1.03, opacity: 0, clipPath: "inset(4% 0% 0% 0%)", duration: .84, ease: "power2.out" }, 0)
    .from(find("[data-headline]"), { yPercent: 102, rotate: 1.2, duration: .74, stagger: .08, ease: "power3.out" }, .08)
    .from(find("[data-hero-reveal]"), { y: 12, opacity: 0, duration: .55, stagger: .055, ease: "power2.out" }, .18)
    .from(find(".site-header, .hero-topline, .hero-bottom"), { y: 5, opacity: 0, duration: .45, stagger: .035, ease: "sine.out" }, .24);
}
