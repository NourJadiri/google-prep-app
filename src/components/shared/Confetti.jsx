import { useEffect, useMemo } from "react";

/* Falling paper in the four logo colours. Burst size carries the meaning:
   12 for a problem, 50 for a station, 60 for a rank-up, 70 for a perfect run,
   90 for the whole line. Silent when the reader asked for less motion. */

const COLS = ["#1a73e8", "#d93025", "#f9ab00", "#1e8e3e"];

export const prefersReducedMotion = () =>
  typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

function Burst({ burst, onDone }) {
  // Frozen at mount so a re-render never re-scatters mid-fall.
  const pieces = useMemo(
    () =>
      Array.from({ length: burst.n || 26 }, (_, i) => ({
        left: Math.random() * 100 + "vw",
        background: COLS[i % 4],
        animationDuration: 0.9 + Math.random() * 1.2 + "s",
        animationDelay: Math.random() * 0.3 + "s",
      })),
    [burst.n]
  );

  useEffect(() => {
    const t = setTimeout(() => onDone(burst.id), 2800);
    return () => clearTimeout(t);
  }, [burst.id, onDone]);

  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((style, i) => (
        <i className="cf" key={i} style={style} />
      ))}
    </div>
  );
}

export default function Confetti({ bursts, onDone }) {
  if (!bursts.length) return null;
  return bursts.map((b) => <Burst key={b.id} burst={b} onDone={onDone} />);
}
