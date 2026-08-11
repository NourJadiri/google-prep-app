// Ranks and badges — ported verbatim from reference/onsite-express.html.
// Content is ground truth: do not rewrite, reword or reorder.
// Regenerate with: node scripts/extract-data.mjs

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
  { id:"half",     ic:"🛤️", n:"Halfway There",  d:"Clear 4 stations" },
  { id:"line",     ic:"🏁", n:"End of the Line", d:"Clear all 7 stations" },
  { id:"noogler",  ic:"🎓", n:"Noogler",        d:"Reach the top rank" },
];

/* Rank dot colours, cycling the four logo colours up the ladder. */
export const RANKCOL: string[] = [
  "var(--blue)", "var(--red)", "var(--yellow)", "var(--green)",
  "var(--blue)", "var(--red)", "var(--yellow)",
];
