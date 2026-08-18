// Ranks and badges. Ported from reference/onsite-express.html, then the two
// station badges were re-worded when the line grew to 14 stations — their
// thresholds live in engine.toggleProb and derive from PLAN.length. This file
// is no longer written by scripts/extract-data.mjs; regenerating would revert
// the badge copy to the 7-station line.

import type { Badge, NonEmpty, Rank } from "../types";

export const RANKS: NonEmpty<Rank> = [
  ["Wanderer", 0], ["Pathfinder", 100], ["Backtracker", 250], ["Memoizer", 450],
  ["Tabulator", 700], ["Pattern Oracle", 1000], ["Noogler", 1350],
];

export const BADGES: Badge[] = [
  { id:"first",    ic:"⚡", n:"First Blood",    d:"Clear your first problem" },
  { id:"ritual5",  ic:"🧘", n:"Template Monk",  d:"Log 5 morning rituals" },
  { id:"metro100", ic:"🚇", n:"Metro Rat",      d:"Answer 100 cards" },
  { id:"perfect",  ic:"💯", n:"Perfect Run",    d:"Score 10/10 in a session" },
  { id:"bugs20",   ic:"🐞", n:"Exterminator",   d:"20 bug hunts right" },
  { id:"streak3",  ic:"🔥", n:"Heating Up",     d:"3-day streak" },
  { id:"streak7",  ic:"☄️", n:"Full Week",      d:"7-day streak" },
  { id:"half",     ic:"🛤️", n:"Halfway There",  d:"Clear 7 stations" },
  { id:"line",     ic:"🏁", n:"End of the Line", d:"Clear all 14 stations" },
  { id:"noogler",  ic:"🎓", n:"Noogler",        d:"Reach the top rank" },
];

/* Rank dot colours, cycling the four logo colours up the ladder. */
export const RANKCOL: string[] = [
  "var(--blue)", "var(--red)", "var(--yellow)", "var(--green)",
  "var(--blue)", "var(--red)", "var(--yellow)",
];
