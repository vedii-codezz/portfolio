"use client";

import { fullMotionQuery } from "./motion-preference";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function PortfolioMotion() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    // Keep selectors scoped to the page even when the loader dispatches reveal
    // from inside its own GSAP context.
    const media = gsap.matchMedia(document.getElementById("portfolio-content") ?? undefined);
    const start = () => {
      media.add(fullMotionQuery, () => {
        gsap.from("[data-stack-category]", {
          y: 20, opacity: 0, duration: .6, stagger: .08, ease: "power2.out",
          clearProps: "transform,opacity",
          scrollTrigger: { trigger: ".toolkit-flip-grid", start: "top 90%", once: true },
        });
        gsap.timeline({ scrollTrigger: { trigger: "#contact", start: "top 85%", once: true } })
          .from("#contact .section-eyebrow", { opacity: 0, duration: .6, clearProps: "opacity" }, 0)
          .from(".contact-line>[data-contact-reveal]", { yPercent: 105, duration: .85, stagger: .12, ease: "power3.out", clearProps: "transform" }, .1)
          .from(".contact-description, .contact-composition>div, .contact-socials>a", { y: 18, opacity: 0, duration: .7, stagger: .12, ease: "power2.out", clearProps: "transform,opacity" }, .42);
        gsap.from("[data-play-reveal]", { y: 28, opacity: 0, stagger: 0.16, duration: 0.8, clearProps: "all", scrollTrigger: { trigger: ".playground-heading", start: "top 90%", once: true } });
        // CSS owns doodle hover transforms; their entrance only owns opacity.
        gsap.from(".pengu-doodle", { opacity: 0, stagger: 0.2, duration: 0.7, clearProps: "opacity", scrollTrigger: { trigger: ".pengu-stage", start: "top 80%", once: true } });
        const float = gsap.to(".pengu-float", { y: -12, rotation: 2, duration: 2.2, ease: "sine.inOut", repeat: -1, yoyo: true, paused: true });
        const visibleMotion = (trigger: string, tween: gsap.core.Tween) => ScrollTrigger.create({ trigger, start: "top bottom", end: "bottom top", onToggle: self => { tween.paused(!self.isActive || document.hidden); } });
        const penguTrigger = visibleMotion(".pengu-stage", float);
        const onVisibility = () => { float.paused(document.hidden || !penguTrigger.isActive); };
        document.addEventListener("visibilitychange", onVisibility);
        // Prebuilt in this context; repeated clicks never stack animations.
        const reaction = gsap.timeline({ paused: true })
          .to(".pengu-reaction", { y: -10, rotation: -3, duration: .2, ease: "power2.out" })
          .to(".pengu-reaction", { y: 0, rotation: 0, duration: .5, ease: "back.out(1.5)" })
          .to(".spark-one", { opacity: .35, duration: .2, repeat: 1, yoyo: true }, 0);
        const react = () => { if (!reaction.isActive()) reaction.restart(); };
        const button = document.querySelector(".pengu-reaction");
        button?.addEventListener("click", react);
        const stage = document.querySelector(".pengu-stage");
        const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
        const enter = () => { if (fine.matches) float.timeScale(1.3); };
        const leave = () => { float.timeScale(1); };
        stage?.addEventListener("pointerenter", enter);
        stage?.addEventListener("pointerleave", leave);
        gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach(element => {
          gsap.from(element, { y: 32, opacity: 0, duration: 0.85, ease: "power2.out", clearProps: "all", scrollTrigger: { trigger: element, start: "top 92%", once: true } });
        });
        return () => {
          document.removeEventListener("visibilitychange", onVisibility);
          button?.removeEventListener("click", react);
          stage?.removeEventListener("pointerenter", enter);
          stage?.removeEventListener("pointerleave", leave);
        };
      });
      media.add(`(hover: hover) and (pointer: fine) and ${fullMotionQuery}`, () => {
        const cleanups: (() => void)[] = [];
        const follow = (surface: HTMLElement, target: HTMLElement, amount: number, tilt = false) => {
          let bounds = surface.getBoundingClientRect();
          let active = false;
          const measure = () => { if (active) bounds = surface.getBoundingClientRect(); };
          const enter = () => { active = true; measure(); };
          const x = gsap.quickTo(target, "x", { duration: .5, ease: "power3.out" });
          const y = gsap.quickTo(target, tilt ? "rotation" : "y", { duration: .5, ease: "power3.out" });
          const move = (event: PointerEvent) => {
            x(gsap.utils.clamp(-1, 1, (event.clientX - bounds.left) / bounds.width * 2 - 1) * amount);
            y(gsap.utils.clamp(-1, 1, tilt ? (event.clientX - bounds.left) / bounds.width * 2 - 1 : (event.clientY - bounds.top) / bounds.height * 2 - 1) * (tilt ? 3 : amount));
          };
          const reset = () => { active = false; x(0); y(0); };
          surface.addEventListener("pointerenter", enter);
          surface.addEventListener("pointermove", move);
          surface.addEventListener("pointerleave", reset);
          window.addEventListener("scroll", measure, { passive: true });
          window.addEventListener("resize", measure);
          cleanups.push(() => {
            surface.removeEventListener("pointerenter", enter);
            surface.removeEventListener("pointermove", move);
            surface.removeEventListener("pointerleave", reset);
            window.removeEventListener("scroll", measure);
            window.removeEventListener("resize", measure);
          });
        };
        const stage = document.querySelector<HTMLElement>(".pengu-stage");
        const character = document.querySelector<HTMLElement>(".pengu-character");
        if (stage && character) follow(stage, character, 10, true);
        const email = document.querySelector<HTMLElement>(".contact-email");
        if (email) follow(email, email, 6);
        return () => cleanups.forEach(cleanup => cleanup());
      });
      media.add(`(min-width: 901px) and (hover: hover) and (pointer: fine) and ${fullMotionQuery}`, () => {
        gsap.to(".portrait-image", { yPercent: 4, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1 } });

      });
    };
    let started = false;
    let startFrame = 0;
    const startOnce = () => {
      if (started) return;
      started = true;
      // Start outside the loader timeline's callback/context, so its cleanup
      // cannot also revert the page's entrance and ScrollTriggers.
      startFrame = requestAnimationFrame(start);
    };
    const waiting = document.documentElement.dataset.lotusLoading === "pending";
    if (!waiting) startOnce();
    window.addEventListener("portfolio:reveal", startOnce);
    window.addEventListener("portfolio:ready", startOnce);
    return () => {
      cancelAnimationFrame(startFrame);
      window.removeEventListener("portfolio:reveal", startOnce);
      window.removeEventListener("portfolio:ready", startOnce);
      media.revert();
    };
  }, []);
  return null;
}
