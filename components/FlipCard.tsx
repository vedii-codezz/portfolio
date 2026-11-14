"use client";

import { reducedMotionQuery, fullMotionQuery } from "./motion-preference";

import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { gsap } from "gsap";
import "./flip-card.css";

type FlipCardProps = {
  front: ReactNode;
  back: ReactNode;
  label?: string;
  axis?: "x" | "y";
  flipOnClick?: boolean;
  draggable?: boolean;
  /** Zero disables drag gestures and translation. Positive values enable swipe-to-flip. */
  dragDistance?: number;
  tilt?: boolean;
  tiltMax?: number;
  glare?: boolean;
  glareOpacity?: number;
  hoverScale?: number;
  perspective?: number;
  stiffness?: number;
  damping?: number;
  width?: CSSProperties["width"];
  height?: CSSProperties["height"];
  radius?: number;
  background?: string;
  color?: string;
  shadow?: boolean;
  shadowColor?: string;
  shadowOpacity?: number;
  onFlipChange?: (flipped: boolean) => void;
};

export default function FlipCard({ front, back, label = "Card", axis = "y", flipOnClick = true,
  draggable = false, dragDistance = 0, tilt = true, tiltMax = 12, glare = true,
  glareOpacity = .14, hoverScale = 1.03, perspective = 1100, stiffness = 170,
  damping = 20, width = "100%", height = 380, radius = 22, background, color,
  shadow = true, shadowColor = "#000000", shadowOpacity = .12, onFlipChange }: FlipCardProps) {
  const [flipped, setFlipped] = useState(false);
  const rotor = useRef<HTMLDivElement>(null);
  const surface = useRef<HTMLDivElement>(null);
  const press = useRef<{ x: number; y: number } | null>(null);
  const suppressClick = useRef(false);
  const id = useId();

  useEffect(() => {
    const node = rotor.current;
    if (!node) return;
    const media = window.matchMedia(reducedMotionQuery);
    const rotation = axis === "y" ? { rotationY: flipped ? 180 : 0 } : { rotationX: flipped ? 180 : 0 };
    const duration = Math.max(.3, Math.min(1.3, .8 * Math.sqrt(170 / Math.max(1, stiffness)) * Math.max(1, damping) / 20));
    const tween = gsap.to(node, { ...rotation, duration: media.matches ? 0 : duration,
      ease: `back.out(${Math.min(1, stiffness / (Math.max(1, damping) * 12))})`, overwrite: true });
    const simplify = () => {
      tween.kill();
      gsap.set(node, rotation);
      surface.current?.style.removeProperty("transform");
    };
    media.addEventListener("change", simplify);
    return () => { tween.kill(); media.removeEventListener("change", simplify); };
  }, [flipped, axis, stiffness, damping]);

  const flip = () => {
    const next = !flipped;
    setFlipped(next);
    onFlipChange?.(next);
  };
  const style = {
    width, minHeight: height, perspective,
    "--flip-radius": `${radius}px`, "--flip-background": background,
    "--flip-color": color, "--flip-glare-opacity": glareOpacity,
    "--flip-shadow": shadow ? `0 16px 32px color-mix(in srgb, ${shadowColor} ${shadowOpacity * 100}%, transparent)` : "none",
  } as CSSProperties;

  return <div className="flip-card" style={style} data-flipped={flipped} data-axis={axis}
    onPointerMove={event => {
      if (event.pointerType !== "mouse" || !window.matchMedia(`(hover: hover) and ${fullMotionQuery}`).matches) return;
      const node = surface.current;
      if (!node) return;
      const bounds = event.currentTarget.getBoundingClientRect();
      const x = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1));
      const y = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1));
      node.style.transform = `rotateX(${tilt ? -y * tiltMax : 0}deg) rotateY(${tilt ? x * tiltMax : 0}deg) scale(${hoverScale})`;
      node.style.setProperty("--flip-light-x", `${(x + 1) * 50}%`);
      node.style.setProperty("--flip-light-y", `${(y + 1) * 50}%`);
    }}
    onPointerLeave={() => { surface.current?.style.removeProperty("transform"); press.current = null; }}
    onPointerDown={event => {
      suppressClick.current = false;
      if (draggable && dragDistance > 0 && event.isPrimary) press.current = { x: event.clientX, y: event.clientY };
    }}
    onPointerCancel={() => { press.current = null; }}
    onPointerUp={event => {
      const start = press.current;
      press.current = null;
      if (!start) return;
      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;
      if (Math.abs(dx) >= dragDistance && Math.abs(dx) > Math.abs(dy)) { suppressClick.current = true; flip(); }
    }}>
    <div className="flip-card-tilt" ref={surface}>
      <div className="flip-card-rotor" ref={rotor}>
        <div className="flip-card-face flip-card-front" data-flip-face="front" aria-hidden={flipped} inert={flipped}>
          <div className="flip-card-content">{front}</div>{glare && <span className="flip-card-glare" aria-hidden="true" />}
        </div>
        <div className="flip-card-face flip-card-back" data-flip-face="back" id={`${id}-back`} aria-hidden={!flipped} inert={!flipped}>
          <div className="flip-card-content">{back}</div>{glare && <span className="flip-card-glare" aria-hidden="true" />}
        </div>
      </div>
      <button type="button" className="flip-card-control" aria-label={`${label}: ${flipped ? "flip back to category" : "explore technologies"}`}
        aria-pressed={flipped} aria-controls={`${id}-back`} disabled={!flipOnClick}
        onClick={() => { if (suppressClick.current) { suppressClick.current = false; return; } flip(); }} />
    </div>
  </div>;
}
