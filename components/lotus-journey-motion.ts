import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { lotusEase } from "./lotus-ease";
import { nodeProgress, vineThrough } from "./journey-motion";

export function animateLotusJourney(journey: HTMLDivElement) {
  const svg = journey.querySelector<SVGSVGElement>(".journey-spine");
  const vine = journey.querySelector<SVGPathElement>("[data-story-vine]");
  const bloom = journey.querySelector<SVGSVGElement>(".journey-bloom");
  if (!svg || !vine || !bloom) return;

  gsap.registerPlugin(ScrollTrigger);
  const chapters = Array.from(journey.querySelectorAll<HTMLElement>(".story-chapter"), chapter => ({
    node: chapter.querySelector<HTMLElement>(".story-node")!,
    leaf: chapter.querySelector<SVGPathElement>("[data-story-leaf]")!,
    text: Array.from(chapter.querySelectorAll<HTMLElement>(".story-period, .story-copy")),
  }));
  const petals = Array.from(bloom.querySelectorAll<SVGPathElement>("[data-story-petal]"));
  const state = { progress: 0 };
  const ease = gsap.parseEase(lotusEase);
  const clamp = gsap.utils.clamp(0, 1);
  let nodes: number[] = [];
  let frame = 0;
  let disposed = false;

  const paint = () => {
    const progress = state.progress;
    vine.style.strokeDashoffset = String(1 - progress);
    chapters.forEach(({ leaf, text }, index) => {
      const start = nodes[index];
      const reveal = ease(clamp((progress - start) / .045));
      leaf.style.transform = `scale(${reveal})`;
      leaf.style.opacity = String(reveal);
      text.forEach(element => {
        element.style.opacity = String(reveal);
        element.style.transform = `translateY(${12 * (1 - reveal)}px)`;
      });
    });
    petals.forEach((petal, index) => {
      const reveal = ease(clamp((progress - .91 - index * .003) / .066));
      petal.style.strokeDashoffset = String(1 - reveal);
      petal.style.transform = `scale(${.55 + .45 * reveal})`;
      petal.style.opacity = String(reveal);
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
    [vine, ...petals, ...chapters.flatMap(({ leaf, text }) => [leaf, ...text])].forEach(element => element.removeAttribute("style"));
  };
}
