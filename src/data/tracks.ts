// The lines. Everything that differs between riding to Google and riding to
// Amazon is a field here, so the engine and the views ask TRACKS[id] instead
// of branching on which line they're on.

import { PLAN } from "./plan";
import { AWS_PLAN } from "./aws";
import { AWS_RANKCOL, AWS_RANKS, RANKCOL, RANKS } from "./meta";
import type { Day, Problem, Track, TrackId } from "../types";

export const TRACKS: Record<TrackId, Track> = {
  google: {
    id: "google",
    name: "Onsite Express",
    company: "Google",
    bullet: "G",
    title: ["Onsite", "Express"],
    blurb: "Two rounds between you and the terminus. Twenty-four stations, one line. Board anywhere.",
    terminus: "GOOGLE",
    unit: "Day",
    plan: PLAN,
    ranks: RANKS,
    rankCol: RANKCOL,
    badges: [
      "first", "ritual5", "metro100", "perfect", "bugs20", "streak3", "streak7",
      "half", "line", "noogler", "green", "green25",
    ],
    award: { first: "first", half: "half", line: "line", top: "noogler" },
    terminusCopy: (cleared) =>
      cleared === PLAN.length
        ? "All " + PLAN.length + " stations cleared. Walk in like you own the whiteboard."
        : cleared + " of " + PLAN.length +
          " stations behind you. The terminus isn't going anywhere — you are.",
    perfectCopy: "Perfect run. The doors open at Google.",
  },
  aws: {
    id: "aws",
    name: "Day One Local",
    company: "Amazon",
    bullet: "A",
    title: ["Day One", "Local"],
    blurb: "The slow train to Amazon. Thirteen stops, one idea each, easy problems only — and no timetable. The Local waits for you.",
    terminus: "DAY ONE",
    unit: "Stop",
    plan: AWS_PLAN,
    ranks: AWS_RANKS,
    rankCol: AWS_RANKCOL,
    badges: [
      "aws1", "metro100", "perfect", "bugs20", "streak3", "streak7",
      "awsHalf", "awsLine", "awsTop", "green", "green25",
    ],
    award: { first: "aws1", half: "awsHalf", line: "awsLine", top: "awsTop" },
    terminusCopy: (cleared) =>
      cleared === AWS_PLAN.length
        ? "All " + AWS_PLAN.length + " stops behind you. The doors at Day One are open."
        : cleared + " of " + AWS_PLAN.length +
          " stops behind you. There's no timetable on the Local — ride when you can.",
    perfectCopy: "Perfect run. Day One is getting closer.",
  },
};

export const TRACK_IDS: readonly TrackId[] = ["google", "aws"];

export const isTrackId = (x: unknown): x is TrackId => x === "google" || x === "aws";

/** Where a problem lives: its row, its station, its line. */
export interface ProblemRef {
  prob: Problem;
  day: Day;
  track: TrackId;
}

/* Keyed by string for the reason plan.ts's lookups are: ids arrive off the
   persisted blob, and a stale one has to be able to miss. Ids are unique
   across lines by construction (short ids on the Google line, slugs on the
   Local); a collision would silently cross-wire progress, so it fails loudly
   at load instead. */
export const PROB_INDEX: Record<string, ProblemRef> = {};
export const DAY_INDEX: Record<string, { day: Day; track: TrackId }> = {};

for (const id of TRACK_IDS) {
  for (const day of TRACKS[id].plan) {
    if (DAY_INDEX[day.id]) throw new Error("Duplicate station id " + day.id);
    DAY_INDEX[day.id] = { day, track: id };
    for (const prob of day.probs) {
      if (PROB_INDEX[prob.id]) throw new Error("Duplicate problem id " + prob.id);
      PROB_INDEX[prob.id] = { prob, day, track: id };
    }
  }
}

/** How many problems a line carries. */
export const totalOf = (id: TrackId): number =>
  TRACKS[id].plan.reduce((a, d) => a + d.probs.length, 0);

/** The problem-bank id a row opens in the workspace: the drill id for a
 *  premium stand-in, else the LeetCode slug. Timed mocks have neither. */
export const specOf = (p: Problem): string | null => p.drill ?? p.slug ?? null;
