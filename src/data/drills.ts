// The premium classics, re-stated in original words and bundled into the app.
// Each .md in ./drills is the single source of truth: written for this repo
// (own statements, own worked examples — LeetCode's paywalled text is not
// copied), imported here as raw strings at build time, so the reader works
// offline and nothing is fetched. The Copy button hands the whole file to the
// clipboard, footer instruction included — that footer is the workflow.

import alienDictionary from "./drills/alien-dictionary.md?raw";
import androidUnlockPatterns from "./drills/android-unlock-patterns.md?raw";
import designHitCounter from "./drills/design-hit-counter.md?raw";
import graphValidTree from "./drills/graph-valid-tree.md?raw";
import longestSubstringKDistinct from "./drills/longest-substring-k-distinct.md?raw";
import meetingRoomsII from "./drills/meeting-rooms-ii.md?raw";
import numberOfIslandsII from "./drills/number-of-islands-ii.md?raw";
import wallsAndGates from "./drills/walls-and-gates.md?raw";

export interface Drill {
  /** The Problem.drill key. */
  id: string;
  /** Display title; the reader's header owns it, so the md's h1 is skipped. */
  n: string;
  /** Eyebrow line: which paywalled classic this stands in for. */
  lc: string;
  /** The full markdown, exactly what Copy puts on the clipboard. */
  md: string;
}

export const DRILLS: Record<string, Drill> = {
  "walls-and-gates": {
    id: "walls-and-gates", n: "Walls and Gates",
    lc: "Stands in for LeetCode 286 · premium", md: wallsAndGates,
  },
  "graph-valid-tree": {
    id: "graph-valid-tree", n: "Graph Valid Tree",
    lc: "Stands in for LeetCode 261 · premium", md: graphValidTree,
  },
  "number-of-islands-ii": {
    id: "number-of-islands-ii", n: "Number of Islands II",
    lc: "Stands in for LeetCode 305 · premium", md: numberOfIslandsII,
  },
  "longest-substring-k-distinct": {
    id: "longest-substring-k-distinct", n: "Longest Substring with At Most K Distinct Characters",
    lc: "Stands in for LeetCode 340 · premium", md: longestSubstringKDistinct,
  },
  "alien-dictionary": {
    id: "alien-dictionary", n: "Alien Dictionary",
    lc: "Stands in for LeetCode 269 · premium", md: alienDictionary,
  },
  "android-unlock-patterns": {
    id: "android-unlock-patterns", n: "Android Unlock Patterns",
    lc: "Stands in for LeetCode 351 · premium", md: androidUnlockPatterns,
  },
  "meeting-rooms-ii": {
    id: "meeting-rooms-ii", n: "Meeting Rooms II",
    lc: "Stands in for LeetCode 253 · premium", md: meetingRoomsII,
  },
  "design-hit-counter": {
    id: "design-hit-counter", n: "Design Hit Counter",
    lc: "Stands in for LeetCode 362 · premium", md: designHitCounter,
  },
};
