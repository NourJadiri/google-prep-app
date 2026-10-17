import { Q } from "../../data/questions";
import type { DeckId, PersistedData, QStat, Question } from "../../types";
import { focusDay } from "./selectors";

export const STOPS = 10;

export function shuffle<T>(arr: readonly T[], rng: () => number): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    // i and j are in range by construction
    const t = a[i]!;
    a[i] = a[j]!;
    a[j] = t;
  }
  return a;
}

// Weakest first; the random term keeps runs from repeating the same ten.
function pickWeighted(
  pool: readonly Question[],
  n: number,
  perQ: Record<string, QStat>,
  rng: () => number
): string[] {
  const scored: Array<[number, string]> = pool.map((q) => {
    const s = perQ[q.id] ?? { seen: 0, right: 0 };
    return [(s.right + 1) / (s.seen + 2) + rng() * 0.55, q.id];
  });
  scored.sort((a, b) => a[0] - b[0]);
  return scored.slice(0, n).map((x) => x[1]);
}

export function buildDeck(data: PersistedData, deckId: DeckId, rng: () => number): string[] {
  const N = STOPS;
  const perQ = data.quiz.perQ;

  if (deckId === "redo") return shuffle(data.quiz.missed, rng).slice(0, N);

  if (deckId === "mix") {
    const ph = focusDay(data).ph;
    const missed = shuffle(data.quiz.missed, rng).slice(0, 3);
    const rest = Q.filter((q) => missed.indexOf(q.id) === -1);
    const focus = ph === "mix" ? [] : rest.filter((q) => q.ph === ph);
    const others = ph === "mix" ? rest : rest.filter((q) => q.ph !== ph);
    const wantF = Math.min(focus.length, Math.ceil((N - missed.length) / 2));
    const idsF = pickWeighted(focus, wantF, perQ, rng);
    const idsO = pickWeighted(others, N - missed.length - wantF, perQ, rng);
    return shuffle(missed.concat(idsF, idsO), rng);
  }

  return shuffle(pickWeighted(Q.filter((q) => q.ph === deckId), N, perQ, rng), rng);
}
