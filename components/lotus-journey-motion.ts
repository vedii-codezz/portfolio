import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { lotusEase } from "./lotus-ease";
import { nodeProgress, vineThrough } from "./journey-motion";

export function animateLotusJourney(journey: HTMLDivElement) {
  const svg = journey.querySelector<SVGSVGElement>(".journey-spine");
  const vine = journey.querySelector<SVGPathElement>("[data-story-vine]");
  if (!svg || !vine) return;

  gsap.registerPlugin(ScrollTrigger);
  const chapters = Array.from(journey.querySelectorAll<HTMLElement>(".story-chapter"), chapter => ({
    node: chapter.querySelector<HTMLElement>(".story-node")!,
    leaf: chapter.querySelector<SVGPathElement>("[data-story-leaf]")!,
    tendril: chapter.querySelector<SVGPathElement>("[data-story-tendril]")!,
    seeds: Array.from(chapter.querySelectorAll<SVGCircleElement>("[data-story-seed]")),
    text: Array.from(chapter.querySelectorAll<HTMLElement>(".story-period, .story-copy")),
    petals: Array.from(chapter.querySelectorAll<SVGGElement>("[data-story-petal]"), group => ({
      group,
      fold: Number(group.dataset.fold),
      fill: group.querySelector<SVGPathElement>("[data-story-fill]")!,
    })),
  }));
  const state = { progress: 0 };
  const ease = gsap.parseEase(lotusEase);
  const clamp = gsap.utils.clamp(0, 1);
  let nodes: number[] = [];
  let frame = 0;
  let disposed = false;

  const paint = () => {
    const progress = state.progress;
    vine.style.strokeDashoffset = String(1 - progress);
    chapters.forEach(({ leaf, tendril, seeds, text, petals }, index) => {
      const start = nodes[index];
      const reveal = ease(clamp((progress - start) / .045));
      leaf.style.transform = `scale(${reveal})`;
      leaf.style.opacity = String(reveal);
      tendril.style.strokeDashoffset = String(1 - ease(clamp((progress - start - .012) / .036)));
      seeds.forEach((seed, i) => {
        seed.style.opacity = String(ease(clamp((progress - start - .034 - i * .004) / .016)));
      });
      text.forEach(element => {
        element.style.opacity = String(reveal);
        element.style.transform = `translateY(${12 * (1 - reveal)}px)`;
      });
      petals.forEach(({ group, fold, fill }, index) => {
        const reveal = ease(clamp((progress - start - index * .004) / .035));
        group.style.transform = `rotate(${fold * (1 - reveal)}deg) scale(${.38 + .62 * reveal})`;
        group.style.opacity = String(reveal);
        fill.style.opacity = String(.08 * ease(clamp((progress - start - .068) / .02)));
      });
    });
  };

  const measure = () => {
    const bounds = svg.getBoundingClientRect();
    const positions = chapters.map(({ node }) => {
      const rect = node.getBoundingClientRect();
      return rect.top + rect.height / 2 - bounds.top;
    });
    svg.setAttribute("viewBox", `0 0 ${bounds.width} ${bounds.height}`);
    vine.setAttribute("d", vineThrough(bounds.width / 2, bounds.height, positions, bounds.width * .3));
    const length = vine.getTotalLength();
    nodes = positions.map(y => nodeProgress(vine, length, y));
    paint();
  };

  measure();
  journey.dataset.storyMotion = "active";
  const animation = gsap.to(state, {
    progress: 1,
    ease: "none",
    onUpdate: paint,
    scrollTrigger: {
      trigger: svg,
      id: "story-vine",
      start: "top 80%",
      end: "bottom 80%",
      scrub: .6,
      onRefreshInit: measure,
    },
  });
  const queueRefresh = () => {
    if (disposed || frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      if (!disposed) ScrollTrigger.refresh();
    });
  };
  const observer = new ResizeObserver(queueRefresh);
  observer.observe(journey);
  chapters.forEach(({ node }) => { if (node.parentElement) observer.observe(node.parentElement); });
  void document.fonts.ready.then(queueRefresh);
  document.fonts.addEventListener("loadingdone", queueRefresh);

  return () => {
    disposed = true;
    observer.disconnect();
    cancelAnimationFrame(frame);
    document.fonts.removeEventListener("loadingdone", queueRefresh);
    animation.scrollTrigger?.kill();
    animation.kill();
    delete journey.dataset.storyMotion;
    vine.style.removeProperty("stroke-dashoffset");
    chapters.forEach(({ leaf, tendril, seeds, text, petals }) => {
      leaf.style.removeProperty("transform");
      leaf.style.removeProperty("opacity");
      tendril.style.removeProperty("stroke-dashoffset");
      [...seeds, ...text].forEach(element => element.removeAttribute("style"));
      petals.forEach(({ group, fill }) => {
        group.removeAttribute("style");
        fill.removeAttribute("style");
      });
    });
  };
}
