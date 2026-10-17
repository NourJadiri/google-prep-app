import type { CSSProperties } from "react";

// Logo tokens, not raw hex, so dark mode's softer variants come along; the Local line gets them too.
const COLS = ["var(--blue)", "var(--red)", "var(--yellow)", "var(--green)"];

export const DEFAULT_PIECES = 26;

/** Scatter for one burst: three random draws per piece, in this order. */
export function confettiPieces(count: number): CSSProperties[] {
  return Array.from({ length: count }, (_, i) => ({
    left: Math.random() * 100 + "vw",
    background: COLS[i % 4],
    animationDuration: 0.9 + Math.random() * 1.2 + "s",
    animationDelay: Math.random() * 0.3 + "s",
  }));
}
