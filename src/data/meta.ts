import type { Badge, NonEmpty, Rank } from "../types";

// Never re-price an existing rung: nobody should be demoted by an update.
export const RANKS: NonEmpty<Rank> = [
  ["Wanderer", 0], ["Pathfinder", 100], ["Backtracker", 250], ["Memoizer", 450],
  ["Tabulator", 700], ["Pattern Oracle", 1000], ["Noogler", 1350],
  ["Graph Whisperer", 1800], ["DP Sensei", 2250], ["Offer Letter", 2750],
];

// One list for every line: the blob's badges map is shared, so ids are global.
export const BADGES: Badge[] = [
  { id:"first",    ic:"⚡", n:"First Blood",    d:"Clear your first problem" },
  { id:"ritual5",  ic:"🧘", n:"Template Monk",  d:"Log 5 morning rituals" },
  { id:"metro100", ic:"🚇", n:"Metro Rat",      d:"Answer 100 cards" },
  { id:"perfect",  ic:"💯", n:"Perfect Run",    d:"Score 10/10 in a session" },
  { id:"bugs20",   ic:"🐞", n:"Exterminator",   d:"20 bug hunts right" },
  { id:"streak3",  ic:"🔥", n:"Heating Up",     d:"3-day streak" },
  { id:"streak7",  ic:"☄️", n:"Full Week",      d:"7-day streak" },
  { id:"half",     ic:"🛤️", n:"Halfway There",  d:"Clear 12 stations" },
  { id:"line",     ic:"🏁", n:"End of the Line", d:"Clear all 24 stations" },
  { id:"noogler",  ic:"🎓", n:"Noogler",        d:"Reach the top rank" },
  { id:"green",    ic:"🟢", n:"All Green",      d:"Pass every test of a problem in the editor" },
  { id:"green25",  ic:"🧪", n:"Test Pilot",     d:"Pass 25 problems in the editor" },
  { id:"aws1",     ic:"📦", n:"First Delivery", d:"Clear your first problem on the Local" },
  { id:"awsHalf",  ic:"🧭", n:"Halfway House",  d:"Clear 7 stations on the Local" },
  { id:"awsLine",  ic:"🏙️", n:"Doors Open",     d:"Clear every station on the Local" },
  { id:"awsTop",   ic:"🎖️", n:"Day One",        d:"Reach the top rank on the Local" },
];

export const AWS_RANKS: NonEmpty<Rank> = [
  ["Applicant", 0], ["Online Assessment", 40], ["Phone Screen", 100],
  ["On the Loop", 180], ["Bar Raiser", 280], ["Offer Extended", 400],
  ["Day One", 560],
];

export const AWS_RANKCOL: string[] = [
  "var(--aws-orange)", "var(--aws-teal)", "var(--aws-ink)", "var(--aws-rust)",
  "var(--aws-orange)", "var(--aws-teal)", "var(--aws-orange)",
];

export const RANKCOL: string[] = [
  "var(--blue)", "var(--red)", "var(--yellow)", "var(--green)",
  "var(--blue)", "var(--red)", "var(--yellow)", "var(--green)",
  "var(--blue)", "var(--red)",
];
