"use client";

import { reducedMotionQuery } from "../motion-preference";

import { useEffect, useRef, useState, type HTMLAttributes } from "react";
import styles from "./text-scramble.module.css";

type TextScrambleProps = Omit<HTMLAttributes<HTMLElement>, "children"> & {
  children: string;
  as?: "span" | "div";
  speed?: number;
  trigger?: boolean;
  onHoverStart?: () => void;
  onScrambleComplete?: () => void;
};

export function TextScramble({ children, as: Tag = "span", speed = .01, trigger = true,
  onHoverStart, onScrambleComplete, className, onPointerEnter, onPointerLeave, ...props }: TextScrambleProps) {
  const root = useRef<HTMLElement>(null);
  const output = useRef<HTMLSpanElement>(null);
  const [restart, setRestart] = useState(0);
  const cancel = useRef<(() => void) | null>(null);

  useEffect(() => {
    const element = root.current;
    const text = output.current;
    if (!trigger || !element || !text) return;
    const media = window.matchMedia(reducedMotionQuery);
    let frame = 0;
    let started: number | undefined;
    let previous = -1;
    const interval = Math.max(.001, speed) * 1000;
    const letters = Array.from(children);
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    const restore = () => {
      cancelAnimationFrame(frame);
      delete element.dataset.scrambling;
      text.textContent = children;
      text.style.removeProperty("transform");
    };
    const finish = () => { restore(); onScrambleComplete?.(); };
    cancel.current = finish;
    const tick = (now: number) => {
      started ??= now;
      const step = Math.floor((now - started) / interval);
      if (step >= letters.length * 3 + 6) { finish(); return; }
      if (step !== previous) {
        previous = step;
        text.textContent = letters.map((letter, index) =>
          /\s/.test(letter) || step >= index * 3 + 6 ? letter : alphabet[Math.floor(Math.random() * alphabet.length)]
        ).join("");
        element.dataset.scrambling = "true";
        // Reserve the original word's dimensions; wider random glyphs fit inside them.
        text.style.transform = `scaleX(${Math.min(1, element.getBoundingClientRect().width / text.offsetWidth)})`;
      }
      frame = requestAnimationFrame(tick);
    };
    if (media.matches) { finish(); return; }
    media.addEventListener("change", finish);
    frame = requestAnimationFrame(tick);
    return () => { restore(); cancel.current = null; media.removeEventListener("change", finish); };
  }, [children, speed, trigger, restart, onScrambleComplete]);

  return <Tag {...props} ref={root as React.Ref<HTMLDivElement & HTMLSpanElement>}
    className={`${styles.word}${className ? ` ${className}` : ""}`}
    onPointerEnter={event => {
      onPointerEnter?.(event);
      if (event.pointerType === "touch") return;
      if (trigger) setRestart(value => value + 1);
      onHoverStart?.();
    }}
    onPointerLeave={event => {
      onPointerLeave?.(event);
      cancel.current?.();
    }}>
    <span className={styles.original}>{children}</span>
    <span ref={output} className={styles.output} aria-hidden="true">{children}</span>
  </Tag>;
}
