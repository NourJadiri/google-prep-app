import type { NonEmpty, Rank } from "../../types";

// Ladders are non-empty; the fallback only satisfies noUncheckedIndexedAccess.
export const rankAt = (ranks: NonEmpty<Rank>, i: number): Rank => ranks[i] ?? ranks[0];

export function rankIdx(ranks: NonEmpty<Rank>, xp: number): number {
  let i = 0;
  for (let k = 0; k < ranks.length; k++) {
    const r = ranks[k];
    if (r && xp >= r[1]) i = k;
  }
  return i;
}

interface RankProgress {
  idx: number;
  name: string;
  pct: number;
  nextLabel: string;
}

export function rankProgress(ranks: NonEmpty<Rank>, xp: number): RankProgress {
  const i = rankIdx(ranks, xp);
  const next = ranks[i + 1];
  const lo = rankAt(ranks, i)[1];
  return {
    idx: i,
    name: rankAt(ranks, i)[0],
    pct: next ? Math.min(100, Math.round(((xp - lo) / (next[1] - lo)) * 100)) : 100,
    nextLabel: next ? next[1] - xp + " XP to " + next[0] : "Terminus rank reached",
  };
}
