"use client";

import { reducedMotionQuery } from "./motion-preference";

import { useEffect, useId, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { Brand } from "./Brand";
import { ThemeControl } from "./ThemeControl";
import "./staggered-menu.css";

type MenuItem = { label: string; ariaLabel?: string; link: string; newTab?: boolean };
type Props = {
  position?: "right" | "left";
  items: readonly MenuItem[];
  socialItems?: readonly MenuItem[];
  displaySocials?: boolean;
  displayItemNumbering?: boolean;
  menuButtonColor?: string;
  openMenuButtonColor?: string;
  changeMenuColorOnOpen?: boolean;
  colors?: readonly [string, string, string];
  logoUrl?: string;
  logo?: ReactNode;
  accentColor?: string;
  onMenuOpen?: () => void;
  onMenuClose?: () => void;
};
type Phase = "closed" | "opening" | "open" | "closing";

export default function StaggeredMenu({
  position = "right", items, socialItems = [], displaySocials = true,
  displayItemNumbering = true, menuButtonColor = "var(--foreground)",
  openMenuButtonColor = "var(--menu-foreground)", changeMenuColorOnOpen = true,
  colors, logoUrl, logo, accentColor = "var(--menu-accent)", onMenuOpen, onMenuClose,
}: Props) {
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const controller = useRef<{ toggle: () => void; close: () => void } | null>(null);
  const pendingAnchor = useRef<string | null>(null);
  const [phase, setPhase] = useState<Phase>("closed");
  const [expanded, setExpanded] = useState(false);
  const id = useId();
  const active = phase !== "closed";

  useEffect(() => {
    const shell = root.current;
    if (!shell) return;
    const media = matchMedia(reducedMotionQuery);
    let desiredOpen = false;
    let release: (() => void) | null = null;
    let disposed = false;
    let focusFrame = 0;
    let timeline: gsap.core.Timeline;

    const lock = () => {
      if (release) return;
      const siblings = Array.from(shell.parentElement?.children ?? [])
        .filter((element): element is HTMLElement => element instanceof HTMLElement && element !== shell)
        .map(element => ({ element, inert: element.inert }));
      const body = document.body;
      const html = document.documentElement;
      const previous = { bodyOverflow: body.style.overflow, htmlOverflow: html.style.overflow, padding: body.style.paddingRight };
      // The loader already reserves a stable gutter. Compensate only on pages
      // where hiding the scrollbar actually releases that space.
      const scrollbar = getComputedStyle(html).scrollbarGutter.includes("stable") ? 0 : window.innerWidth - html.clientWidth;
      siblings.forEach(({ element }) => { element.inert = true; });
      if (scrollbar > 0) body.style.paddingRight = `${parseFloat(getComputedStyle(body).paddingRight) + scrollbar}px`;
      body.style.overflow = "hidden";
      html.style.overflow = "hidden";
      shell.style.setProperty("--menu-scrollbar", `${scrollbar}px`);
      release = () => {
        siblings.forEach(({ element, inert }) => { element.inert = inert; });
        body.style.overflow = previous.bodyOverflow;
        html.style.overflow = previous.htmlOverflow;
        body.style.paddingRight = previous.padding;
        shell.style.removeProperty("--menu-scrollbar");
      };
    };
    const finishOpen = () => {
      if (!desiredOpen || disposed) return;
      setPhase("open");
      cancelAnimationFrame(focusFrame);
      focusFrame = requestAnimationFrame(() => {
        if (desiredOpen && !disposed) shell.querySelector<HTMLAnchorElement>(".staggered-links a")?.focus({ preventScroll: true });
      });
    };
    const finishClose = () => {
      if (desiredOpen || disposed || !release) return;
      release(); release = null;
      setPhase("closed");
      button.current?.focus({ preventScroll: true });
      const hash = pendingAnchor.current;
      pendingAnchor.current = null;
      if (hash) {
        const destination = document.getElementById(hash.slice(1));
        if (destination) {
          if (window.location.hash !== hash) history.pushState(history.state, "", hash);
          destination.scrollIntoView({ behavior: media.matches ? "instant" : "smooth", block: "start" });
        }
      }
      onMenuClose?.();
    };
    const context = gsap.context(() => {
      timeline = gsap.timeline({ paused: true, onComplete: finishOpen, onReverseComplete: finishClose })
        .fromTo("[data-menu-layer]", { x: 0, xPercent: position === "right" ? 101 : -101 }, { x: 0, xPercent: 0, duration: .42, stagger: .065, ease: "power3.inOut" }, 0)
        .fromTo("[data-menu-label]", { yPercent: 115, rotation: 3, opacity: 0 }, { yPercent: 0, rotation: 0, opacity: 1, duration: .34, stagger: .04, ease: "power3.out" }, .28)
        .fromTo("[data-menu-social]", { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: .2, stagger: .04, ease: "power2.out" }, .58)
        .fromTo(".staggered-backdrop", { opacity: 0 }, { opacity: 1, duration: .3, ease: "sine.out" }, 0);
    }, shell);

    const close = () => {
      if (!desiredOpen) return;
      desiredOpen = false;
      setExpanded(false); setPhase("closing");
      button.current?.focus({ preventScroll: true });
      if (media.matches || timeline.progress() === 0) { timeline.pause().progress(0, true); finishClose(); }
      else timeline.timeScale(1.35).reverse();
    };
    const open = () => {
      // A modal must never overtake the lotus loader or its floral transition.
      const loading = document.documentElement.dataset.lotusLoading;
      if (loading === "pending" || loading === "revealing" || desiredOpen) return;
      pendingAnchor.current = null;
      desiredOpen = true;
      lock(); setExpanded(true); setPhase("opening");
      if (media.matches || timeline.progress() === 1) { timeline.pause().progress(1, true); finishOpen(); }
      else timeline.timeScale(1).play();
      onMenuOpen?.();
    };
    controller.current = { toggle: () => { if (desiredOpen) close(); else open(); }, close };

    const focusable = () => Array.from(shell.querySelectorAll<HTMLElement>("a[href],button:not([disabled]),[tabindex='0']"))
      .filter(element => !element.closest("[inert]") && element.getClientRects().length > 0);
    const onKey = (event: KeyboardEvent) => {
      if (!release) return;
      if (event.key === "Escape") { event.preventDefault(); close(); }
      if (event.key !== "Tab") return;
      const elements = focusable();
      const first = elements[0], last = elements[elements.length - 1];
      if (event.shiftKey && (document.activeElement === first || !shell.contains(document.activeElement))) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || !shell.contains(document.activeElement))) { event.preventDefault(); first?.focus(); }
    };
    const onFocus = (event: FocusEvent) => {
      if (release && !shell.contains(event.target as Node)) button.current?.focus({ preventScroll: true });
    };
    const onMotion = () => {
      if (!media.matches || !release) return;
      timeline.pause().progress(desiredOpen ? 1 : 0, true);
      if (desiredOpen) finishOpen(); else finishClose();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("focusin", onFocus);
    media.addEventListener("change", onMotion);
    return () => {
      disposed = true;
      controller.current = null;
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("focusin", onFocus);
      media.removeEventListener("change", onMotion);
      cancelAnimationFrame(focusFrame);
      context.revert();
      release?.();
    };
  }, [position, onMenuOpen, onMenuClose]);

  const followAnchor = (event: MouseEvent<HTMLAnchorElement>, link: string) => {
    if (!active || !link.startsWith("#") || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    pendingAnchor.current = link;
    controller.current?.close();
  };
  const style = {
    "--menu-button-color": menuButtonColor,
    "--menu-button-open-color": changeMenuColorOnOpen ? openMenuButtonColor : menuButtonColor,
    "--menu-custom-accent": accentColor,
    ...(colors ? { "--menu-layer-one": colors[0], "--menu-layer-two": colors[1], "--menu-panel": colors[2] } : {}),
  } as CSSProperties;

  return <div ref={root} className="navigation-shell" data-menu-state={phase} data-position={position} style={style}
    role={active ? "dialog" : undefined} aria-modal={active ? true : undefined} aria-label={active ? "Site navigation" : undefined}>
    <header className="site-header">
      <a className="wordmark" href="#home" aria-label="Bedantika Mondal, home" onClick={event => followAnchor(event, "#home")}>
        {logo ?? (logoUrl ? <Image src={logoUrl} alt="Bedantika Mondal" width={190} height={48} unoptimized /> : <Brand />)}
      </a>
      <div className="navigation-actions">
        <ThemeControl />
        <button ref={button} type="button" className="menu-toggle" aria-controls={id} aria-expanded={expanded} aria-haspopup="dialog" onClick={() => controller.current?.toggle()}>
          <span>{expanded ? "Close" : "Menu"}</span><span className="menu-toggle-icon" aria-hidden="true"><i /><i /></span>
        </button>
      </div>
    </header>
    <div className="staggered-overlay" id={id} inert={phase === "closed" || phase === "closing"} aria-hidden={phase === "closed" || phase === "closing"}>
      <div className="staggered-backdrop" onClick={() => controller.current?.close()} aria-hidden="true" />
      <div className="staggered-layer staggered-layer-one" data-menu-layer aria-hidden="true" />
      <div className="staggered-layer staggered-layer-two" data-menu-layer aria-hidden="true" />
      <div ref={panel} className="staggered-panel" data-menu-layer>
        <p className="staggered-eyebrow">A LITTLE EXPLORING <span aria-hidden="true">/ 01—{String(items.length).padStart(2, "0")}</span></p>
        <nav className="staggered-links" aria-label="Main navigation">
          {items.map((item, index) => <a key={item.link} href={item.link} aria-label={item.ariaLabel}
            target={item.newTab ? "_blank" : undefined} rel={item.newTab ? "noopener noreferrer" : undefined}
            onClick={event => followAnchor(event, item.link)}>
            {displayItemNumbering && <span className="menu-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>}
            <span className="menu-label-mask"><span data-menu-label>{item.label}</span></span>
            <span className="menu-link-arrow" aria-hidden="true">↗</span>
          </a>)}
        </nav>
        {displaySocials && <div className="staggered-socials">
          <span className="staggered-social-label" data-menu-social>ELSEWHERE</span>
          <div>{socialItems.map(item => <a key={item.link} href={item.link} data-menu-social
            {...(item.link.startsWith("https://") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
            {item.label} <span aria-hidden="true">↗</span>
          </a>)}</div>
        </div>}
      </div>
    </div>
  </div>;
}
