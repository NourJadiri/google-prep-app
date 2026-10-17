import type { Spot } from "./storage";

const GAP = 12;
const MIN_W = 320;
const MIN_H = 300;

/* Inside the viewport, whatever the window was left at on a bigger screen. */
export function fit(s: Spot): Spot {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const w = Math.max(MIN_W, Math.min(s.w, vw - 2 * GAP));
  const h = Math.max(MIN_H, Math.min(s.h, vh - 2 * GAP));
  return {
    w,
    h,
    x: Math.max(GAP, Math.min(s.x, vw - w - GAP)),
    y: Math.max(GAP, Math.min(s.y, vh - h - GAP)),
  };
}

/* Bottom right, over the console, where it covers the least of the code. */
export function firstSpot(): Spot {
  const w = 400;
  const h = Math.min(560, window.innerHeight - 140);
  return fit({ w, h, x: window.innerWidth - w - 24, y: window.innerHeight - h - 24 });
}
