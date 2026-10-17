import type { StampedConfetti } from "../../../types";
import ConfettiBurst from "./ConfettiBurst";

interface ConfettiProps {
  bursts: StampedConfetti[];
  onDone: (id: number) => void;
}

export default function Confetti({ bursts, onDone }: ConfettiProps) {
  if (!bursts.length) return null;
  return bursts.map((b) => <ConfettiBurst key={b.id} burst={b} onDone={onDone} />);
}
