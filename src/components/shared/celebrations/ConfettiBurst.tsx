import { useMemo } from "react";
import type { StampedConfetti } from "../../../types";
import { useExpiry } from "./hooks/useExpiry";
import { CONFETTI_MS } from "./lib/lifetimes";
import { DEFAULT_PIECES, confettiPieces } from "./lib/confettiPieces";
import "./ConfettiBurst.css";

interface ConfettiBurstProps {
  burst: StampedConfetti;
  onDone: (id: number) => void;
}

export default function ConfettiBurst({ burst, onDone }: ConfettiBurstProps) {
  // Frozen at mount so a re-render never re-scatters mid-fall.
  const pieces = useMemo(() => confettiPieces(burst.n || DEFAULT_PIECES), [burst.n]);
  useExpiry(burst.id, CONFETTI_MS, onDone);

  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((style, i) => (
        <i className="cf" key={i} style={style} />
      ))}
    </div>
  );
}
