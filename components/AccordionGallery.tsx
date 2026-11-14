"use client";

/**
 * AccordionGallery
 * A row (or column) of image panels where one panel is expanded and the rest
 * are collapsed. In `trigger="scroll"` mode the gallery pins in place and the
 * expanded panel advances as you scroll; `hover` and `click` modes are also
 * supported. Needs `gsap` (with ScrollTrigger) and nothing else.
 *
 * Notes
 *  - Don't put it inside a parent that has `transform`, `filter` or
 *    `overflow: hidden/auto` — ScrollTrigger pinning breaks inside those.
 *  - Under `prefers-reduced-motion`, scroll mode falls back to click mode:
 *    no pinning, no entrance, no parallax/tilt, instant transitions.
 *  - Below `mobileBreakpoint` the gallery switches to a vertical accordion.
 */

import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./AccordionGallery.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const RING_ON = 0.55;
const TINT_OFF = 0.55;
const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

export interface AccordionGalleryItem {
  image: string;
  /** Project name. Also used as the accessible name of the panel. */
  label: string;
  /** Where the active panel goes when clicked. Omit for a non-link panel. */
  link?: string;
  /** Short line under the label on the expanded panel (e.g. a tagline). */
  meta?: string;
  /** Alt text. Defaults to "" because the panel already has an accessible name. */
  alt?: string;
}

export interface AccordionGalleryProps {
  items: AccordionGalleryItem[];
  defaultIndex?: number;
  /** Share of the main axis the expanded panel takes (0.2–0.9). */
  expandRatio?: number;
  trigger?: "scroll" | "hover" | "click";
  accentColor?: string;
  overlayColor?: string;
  textColor?: string;
  /** Collapsed panels are grayscale and fade to color when expanded. */
  grayscale?: boolean;
  showLabels?: boolean;
  /** Show the small 01 / 02 numerals. Turn off if your content isn't a sequence. */
  showIndex?: boolean;
  duration?: number;
  ease?: string;
  /** 0–1. Pointer parallax on the image, plus scroll drift in scroll mode. */
  parallax?: number;
  /** Max pointer tilt in degrees on the expanded panel. 0 disables it. */
  tilt?: number;
  /** Stagger (seconds) of the entrance reveal. */
  stagger?: number;
  height?: number;
  gap?: number;
  radius?: number;
  orientation?: "horizontal" | "vertical";
  /** Scroll mode: viewport-heights of scrolling per panel step. */
  scrollPerItem?: number;
  /** Scroll mode: settle on a panel when scrolling stops. */
  snap?: boolean;
  /** Below this width (px) the gallery becomes a vertical accordion. */
  mobileBreakpoint?: number;
  mobileHeight?: number;
  /** Rendered above the gallery and pinned together with it in scroll mode. */
  header?: ReactNode;
  ariaLabel?: string;
  /** Custom image renderer (e.g. next/image). Apply `className` to the <img>. */
  renderImage?: (
    item: AccordionGalleryItem,
    props: { className: string },
  ) => ReactNode;
  /** Called when the already-expanded panel is clicked. Call e.preventDefault() to stop navigation. */
  onItemClick?: (
    item: AccordionGalleryItem,
    index: number,
    event: MouseEvent<HTMLElement>,
  ) => void;
  onActiveChange?: (index: number) => void;
  className?: string;
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useIsoLayoutEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatches(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [query]);
  return matches;
}

export default function AccordionGallery({
  items,
  defaultIndex = 0,
  expandRatio = 0.5,
  trigger = "scroll",
  accentColor = "#ffffff",
  overlayColor = "#060010",
  textColor = "#ffffff",
  grayscale = true,
  showLabels = true,
  showIndex = true,
  duration = 0.6,
  ease = "power3.out",
  parallax = 0.5,
  tilt = 8,
  stagger = 0.06,
  height = 460,
  gap = 10,
  radius = 16,
  orientation = "horizontal",
  scrollPerItem = 0.8,
  snap = false,
  mobileBreakpoint = 640,
  mobileHeight = 560,
  header,
  ariaLabel = "Project gallery",
  renderImage,
  onItemClick,
  onActiveChange,
  className,
}: AccordionGalleryProps) {
  const n = items.length;
  const startIndex = clamp(defaultIndex, 0, Math.max(n - 1, 0));

  const rootRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLElement | null)[]>([]);
  const stRef = useRef<ScrollTrigger | null>(null);
  const activeRef = useRef(startIndex);
  const lockUntil = useRef(0);
  const mounted = useRef(false);
  const [active, setActive] = useState(startIndex);

  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const narrow = useMediaQuery(`(max-width: ${mobileBreakpoint}px)`);
  const canHover = useMediaQuery("(hover: hover) and (pointer: fine)");

  const vertical = orientation === "vertical" || narrow;
  const mode = (reduced || vertical) && trigger === "scroll" ? "click" : trigger;
  const trackHeight = narrow ? Math.max(height, mobileHeight) : height;
  const fx = canHover && !reduced;

  // Flex-grow weights: the expanded panel gets `expandRatio` of the main axis.
  const { activeGrow, restGrow } = useMemo(() => {
    if (n <= 1) return { activeGrow: 100, restGrow: 100 };
    const r = clamp(expandRatio, 0.2, 0.9);
    return { activeGrow: r * 100, restGrow: ((1 - r) * 100) / (n - 1) };
  }, [n, expandRatio]);

  const commit = useCallback(
    (i: number) => {
      if (i === activeRef.current) return;
      activeRef.current = i;
      setActive(i);
      onActiveChange?.(i);
    },
    [onActiveChange],
  );

  /** Animate (or snap) every panel to the given active index. */
  const applyActive = useCallback(
    (index: number, animate: boolean) => {
      const d = animate && !reduced ? duration : 0;
      const to = (el: Element | null | undefined, vars: gsap.TweenVars) => {
        if (!el) return;
        if (d > 0) gsap.to(el, { ...vars, duration: d, ease, overwrite: "auto" });
        else {
          const { delay, ...rest } = vars;
          void delay;
          gsap.set(el, rest);
        }
      };
      panelRefs.current.forEach((panel, i) => {
        if (!panel) return;
        const on = i === index;
        to(panel, {
          flexGrow: on ? activeGrow : restGrow,
          ...(on ? {} : { rotationX: 0, rotationY: 0 }),
        });
        to(panel.querySelector(".ag-img"), {
          ...(grayscale ? { filter: `grayscale(${on ? 0 : 1})` } : {}),
          ...(on ? {} : { x: 0, y: 0 }),
        });
        to(panel.querySelector(".ag-tint"), { opacity: on ? 0 : TINT_OFF });
        to(panel.querySelector(".ag-ring"), { opacity: on ? RING_ON : 0 });
        to(panel.querySelector(".ag-label--rest"), { opacity: on ? 0 : 1 });
        to(panel.querySelector(".ag-label--on"), {
          opacity: on ? 1 : 0,
          y: on ? 0 : 10,
          delay: on ? d * 0.3 : 0,
        });
        to(panel.querySelector(".ag-go"), { opacity: on ? 1 : 0 });
        panel.style.zIndex = on ? "2" : "1";
      });
    },
    [reduced, duration, ease, activeGrow, restGrow, grayscale],
  );

  useIsoLayoutEffect(() => {
    applyActive(active, mounted.current);
    mounted.current = true;
  }, [active, applyActive]);

  // Scroll mode: pin the gallery and map scroll progress to the active panel.
  useIsoLayoutEffect(() => {
    if (mode !== "scroll" || n < 2) return;
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const prop = "x";
      const setters = panelRefs.current.map((p) => {
        const media = p?.querySelector<HTMLElement>(".ag-media");
        return media ? gsap.quickSetter(media, prop, "px") : null;
      });
      const maxDrift = parallax * 20;
      const drift = (pos: number) =>
        setters.forEach((set, i) =>
          set?.(clamp((i - pos) * parallax * 10, -maxDrift, maxDrift)),
        );
      drift(activeRef.current);

      const st = ScrollTrigger.create({
        trigger: root,
        start: () =>
          root.offsetHeight > window.innerHeight ? "top top" : "center center",
        end: () =>
          `+=${Math.round(window.innerHeight * scrollPerItem * (n - 1))}`,
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        snap: snap ? { snapTo: 1 / (n - 1), duration: 0.3, delay: 0.05 } : undefined,
        onUpdate: (self) => {
          const pos = self.progress * (n - 1);
          drift(pos);
          if (performance.now() < lockUntil.current) return;
          commit(clamp(Math.round(pos), 0, n - 1));
        },
      });
      stRef.current = st;
    }, root);

    let disposed = false;
    void document.fonts.ready.then(() => {
      if (!disposed) ScrollTrigger.refresh();
    });
    return () => {
      disposed = true;
      stRef.current = null;
      ctx.revert();
    };
  }, [mode, n, vertical, scrollPerItem, snap, parallax, commit]);

  // Entrance: panels rise in once when the gallery nears the viewport.
  useIsoLayoutEffect(() => {
    if (reduced || n === 0) return;
    const root = rootRef.current;
    if (!root) return;
    const panels = panelRefs.current.filter(Boolean) as HTMLElement[];

    const ctx = gsap.context(() => {
      gsap.set(panels, { opacity: 0, y: 48 });
      let shown = false;
      const show = () => {
        if (shown) return;
        shown = true;
        gsap.to(panels, {
          opacity: 1,
          y: 0,
          duration: duration * 1.2,
          ease,
          stagger,
          clearProps: "opacity,y",
        });
      };
      const st = ScrollTrigger.create({
        trigger: root,
        start: "top 85%",
        onEnter: show,
        onEnterBack: show,
      });
      // Already past the start (reload mid-page): don't leave panels hidden.
      if (st.scroll() >= st.start) show();
    }, root);

    return () => ctx.revert();
  }, [reduced, n, duration, ease, stagger, vertical]);

  const scrollToIndex = useCallback(
    (i: number) => {
      const st = stRef.current;
      if (!st || n < 2) return;
      lockUntil.current = performance.now() + 1100;
      commit(i);
      window.scrollTo({
        top: Math.round(st.start + (i / (n - 1)) * (st.end - st.start)),
        behavior: reduced ? "auto" : "smooth",
      });
    },
    [n, reduced, commit],
  );

  const activate = (i: number) => {
    if (i === activeRef.current) return;
    if (mode === "scroll" && stRef.current) scrollToIndex(i);
    else commit(i);
  };

  const handleClick = (e: MouseEvent<HTMLElement>, i: number) => {
    if (i !== activeRef.current) {
      // First tap/click expands; the next one follows the link.
      e.preventDefault();
      activate(i);
      return;
    }
    onItemClick?.(items[i], i, e);
  };

  const handlePointerEnter = (e: PointerEvent<HTMLElement>, i: number) => {
    if (mode === "hover" && e.pointerType === "mouse") activate(i);
  };

  const handlePointerMove = (e: PointerEvent<HTMLElement>, i: number) => {
    if (!fx || i !== activeRef.current) return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const nx = ((e.clientX - r.left) / r.width - 0.5) * 2;
    const ny = ((e.clientY - r.top) / r.height - 0.5) * 2;
    if (tilt > 0) {
      gsap.to(el, {
        rotationY: nx * tilt,
        rotationX: -ny * tilt,
        transformPerspective: 1000,
        duration: 0.5,
        ease: "power2.out",
        overwrite: "auto",
      });
    }
    const img = el.querySelector(".ag-img");
    if (parallax > 0 && img) {
      gsap.to(img, {
        x: -nx * parallax * 8,
        y: -ny * parallax * 8,
        duration: 0.6,
        ease: "power2.out",
        overwrite: "auto",
      });
    }
  };

  const resetFx = () => {
    panelRefs.current.forEach((p) => {
      if (!p) return;
      gsap.to(p, {
        rotationX: 0,
        rotationY: 0,
        duration: 0.6,
        ease: "power3.out",
        overwrite: "auto",
      });
      const img = p.querySelector(".ag-img");
      if (img) {
        gsap.to(img, { x: 0, y: 0, duration: 0.6, ease: "power3.out", overwrite: "auto" });
      }
    });
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const focused = panelRefs.current.findIndex(
      (p) => p === document.activeElement,
    );
    const cur = focused >= 0 ? focused : activeRef.current;
    let next = cur;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = cur + 1;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = cur - 1;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = n - 1;
    else return;
    e.preventDefault();
    next = clamp(next, 0, n - 1);
    activate(next);
    panelRefs.current[next]?.focus({ preventScroll: !vertical });
  };

  if (n === 0) return null;

  const rootStyle = {
    "--ag-accent": accentColor,
    "--ag-overlay": overlayColor,
    "--ag-text": textColor,
    "--ag-gap": `${gap}px`,
    "--ag-radius": `${radius}px`,
    "--ag-height": `${trackHeight}px`,
    "--ag-bleed": `${Math.ceil(parallax * 28)}px`,
  } as CSSProperties;

  return (
    <div
      ref={rootRef}
      className={`ag-root${className ? ` ${className}` : ""}`}
      style={rootStyle}
    >
      {header ? <div className="ag-header">{header}</div> : null}

      <div
        className={`ag-track ${vertical ? "is-vertical" : "is-horizontal"}${
          grayscale ? " has-gray" : ""
        }`}
        role="group"
        aria-label={ariaLabel}
        onKeyDown={handleKeyDown}
        onPointerLeave={fx && (tilt > 0 || parallax > 0) ? resetFx : undefined}
      >
        {items.map((item, i) => {
          const isActive = i === active;
          const Tag: React.ElementType = item.link ? "a" : "div";
          const linkProps = item.link ? { href: item.link } : { tabIndex: 0 };
          const name = item.meta ? `${item.label}, ${item.meta}` : item.label;
          const numeral = String(i + 1).padStart(2, "0");

          return (
            <Tag
              key={`${item.label}-${i}`}
              ref={(el: HTMLElement | null) => {
                panelRefs.current[i] = el;
              }}
              className={`ag-panel${isActive ? " is-active" : ""}`}
              style={{ flexBasis: 0, flexShrink: 1 }}
              aria-label={name}
              aria-current={i === active ? "true" : undefined}
              onMouseDown={(event: MouseEvent<HTMLElement>) => {
                if (event.button === 0 && i !== activeRef.current) event.preventDefault();
              }}
              onClick={(e: MouseEvent<HTMLElement>) => handleClick(e, i)}
              onFocus={(event: React.FocusEvent<HTMLElement>) => {
                if (event.currentTarget.matches(":focus-visible")) activate(i);
              }}
              onPointerEnter={(e: PointerEvent<HTMLElement>) => handlePointerEnter(e, i)}
              onPointerMove={(e: PointerEvent<HTMLElement>) => handlePointerMove(e, i)}
              {...linkProps}
            >
              <div className="ag-media">
                {renderImage ? (
                  renderImage(item, { className: "ag-img" })
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    className="ag-img"
                    src={item.image}
                    alt={item.alt ?? ""}
                    loading="lazy"
                    draggable={false}
                  />
                )}
              </div>
              <div className="ag-tint" aria-hidden="true" />
              <div className="ag-shade" aria-hidden="true" />
              <div className="ag-ring" aria-hidden="true" />

              {showLabels && (
                <>
                  <span className="ag-label ag-label--rest" aria-hidden="true">
                    {showIndex && <span className="ag-index">{numeral}</span>}
                    <span className="ag-name">{item.label}</span>
                  </span>
                  <span className="ag-label ag-label--on" aria-hidden="true">
                    {showIndex && <span className="ag-index">{numeral}</span>}
                    <span className="ag-title">{item.label}</span>
                    {item.meta && <span className="ag-meta">{item.meta}</span>}
                  </span>
                  {item.link && (
                    <span className="ag-go" aria-hidden="true">
                      <svg viewBox="0 0 16 16" width="14" height="14" fill="none">
                        <path
                          d="M4.5 11.5l7-7M5.5 4.5h6v6"
                          stroke="currentColor"
                          strokeWidth="1.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  )}
                </>
              )}
            </Tag>
          );
        })}
      </div>

      <p className="ag-sr" aria-live="polite">
        {`${items[active]?.label ?? ""}, ${active + 1} of ${n}`}
      </p>
    </div>
  );
}
