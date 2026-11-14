// Cylinder/tile model and spring constants adapted from React Bits CircularCarousel.
// https://github.com/DavidHDev/react-bits/blob/main/src/content/Components/CircularCarousel/CircularCarousel.jsx
export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
export const wrapIndex = (value: number, count: number) => ((value % count) + count) % count;
export const wrapDegrees = (value: number) => wrapIndex(value + 180, 360) - 180;
export const nearestProject = (angle: number, count: number) => wrapIndex(Math.round(-angle / (360 / count)), count);

export function angularFocus(angle: number, hovered = false) {
  const distance = Math.abs(wrapDegrees(angle)) / 180;
  return { blur: Math.max(0, 4 * distance - (hovered ? 1.2 : 0)),
    opacity: Math.min(1, 1 - .55 * distance + (hovered ? .16 : 0)) };
}

export function ringRadius(count: number, width: number, gap: number, curve = 1) {
  const n = Math.max(count, 3);
  const pitch = width + gap;
  const chord = pitch / (2 * Math.sin(Math.PI / n));
  const arc = n * pitch / (2 * Math.PI);
  return Math.max(chord + (arc - chord) * clamp(curve, 0, 1), width * .6);
}

export function bendTiles(width: number, radius: number, curve = 1, segments = 8) {
  const total = curve > .001 ? segments : 1;
  const bendRadius = curve > .001 ? radius / curve : 0;
  return Array.from({ length: total }, (_, index) => {
    const start = index * width / total - (index ? 1.25 : 0);
    const end = (index + 1) * width / total + (index < total - 1 ? 1.25 : 0);
    const center = (start + end - width) / 2;
    const angle = bendRadius ? center / bendRadius : 0;
    return { start, end, size: end - start, x: bendRadius ? bendRadius * Math.sin(angle) : center,
      z: bendRadius ? bendRadius * (Math.cos(angle) - 1) : 0, angle: angle * 180 / Math.PI };
  });
}

export type RingMotion = { angle: number; velocity: number; target: number | null };
export function advanceRing(state: RingMotion, seconds: number, momentum = .6) {
  let { angle, velocity, target } = state;
  const dt = clamp(seconds, 0, .05);
  if (target !== null) {
    let remaining = dt;
    while (remaining > 0) {
      const step = Math.min(remaining, 1 / 240);
      velocity += (118 * (target - angle) - 2 * Math.sqrt(118) * velocity) * step;
      angle += velocity * step;
      remaining -= step;
    }
    if (Math.abs(target - angle) < .004 && Math.abs(velocity) < .03) {
      angle = target; velocity = 0; target = null;
    }
  } else if (Math.abs(velocity) > .01) {
    velocity *= Math.exp(-dt / (.18 + clamp(momentum, 0, 1) * 1.5));
    angle += velocity * dt;
  } else velocity = 0;
  return { angle, velocity, target };
}

export function releaseTarget(angle: number, velocity: number, step: number, momentum: number) {
  const projection = clamp(velocity, -1400, 1400) * (.18 + clamp(momentum, 0, 1) * 1.5) * .55;
  return Math.round((angle + projection) / step) * step || 0;
}
