import type { Day, TrackData } from "../../../types";

export interface DayStatus {
  /** How many of the day's problems are ticked. */
  doneN: number;
  /** Every problem ticked: the station is cleared. */
  done: boolean;
  /** The station being worked on: the focus day, until it is cleared. */
  now: boolean;
}

export function dayStatus(day: Day, done: TrackData["done"], focusId: string): DayStatus {
  const doneN = day.probs.filter((p) => done[p.id]).length;
  const cleared = doneN === day.probs.length;
  return { doneN, done: cleared, now: day.id === focusId && !cleared };
}
