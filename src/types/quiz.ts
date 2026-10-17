import type { DeckId } from "./content";

export type RunPhase = "ask" | "reveal" | "done";

export interface Session {
  deck: DeckId;
  /** The ten card ids, in the order they will be shown. */
  ids: string[];
  /** Index into `ids`. */
  i: number;
  streak: number;
  best: number;
  right: number;
  /** XP earned in this run alone. */
  xp: number;
  phase: RunPhase;
  /** One entry per answered card, oldest first. */
  results: boolean[];
  /** order[slot] is the stored index of the option in that slot. Re-dealt on every card. */
  order: number[];
  /** The slot tapped, once revealed. */
  picked: number | null;
}
