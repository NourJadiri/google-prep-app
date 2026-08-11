// The 7-day plan — ported verbatim from reference/onsite-express.html.
// Content is ground truth: do not rewrite, reword or reorder.
// Regenerate with: node scripts/extract-data.mjs

import type { Day, Diff, NonEmpty, Problem } from "../types";

export const LC: (slug: string) => string = s => "https://leetcode.com/problems/" + s + "/";
export const XPD: Record<Diff, number> = { E: 10, M: 20, H: 40 };
export const RITUAL_XP: number = 15;

export const PLAN: NonEmpty<Day> = [
  { id:"d1", d:1, stn:"Pathfinding", color:"var(--blue)", ph:"graphs",
    name:"Paths as first-class objects",
    note:"DFS that carries a path — your reconstruction rehab. Decide once: mutate + copy at the leaf, or copy on every call. Pop on the way out.",
    ritual:"Write from memory: a DFS collecting all root-to-leaf paths.",
    probs:[
      { id:"ap",  n:"All Paths From Source to Target", slug:"all-paths-from-source-to-target", diff:"M" },
      { id:"btp", n:"Binary Tree Paths", slug:"binary-tree-paths", diff:"E" },
      { id:"ps2", n:"Path Sum II", slug:"path-sum-ii", diff:"M" },
      { id:"lsw", n:"Last Stone Weight", slug:"last-stone-weight", diff:"E", warm:true },
    ]},
  { id:"d2", d:2, stn:"Backtrack Jct.", color:"var(--red)", ph:"bt",
    name:"The backtracking skeleton",
    note:"Choose → explore → un-choose. A start index gives every combination exactly one spelling.",
    ritual:"Write the skeleton cold: for loop, append, recurse, pop.",
    probs:[
      { id:"sub", n:"Subsets", slug:"subsets", diff:"M" },
      { id:"perm", n:"Permutations", slug:"permutations", diff:"M" },
      { id:"cs2", n:"Combination Sum II", slug:"combination-sum-ii", diff:"M" },
      { id:"kls", n:"Kth Largest Element in a Stream", slug:"kth-largest-element-in-a-stream", diff:"E", warm:true },
    ]},
  { id:"d3", d:3, stn:"Constraint St.", color:"var(--red)", ph:"bt",
    name:"Backtracking under constraints",
    note:"Same skeleton, harder pruning: palindrome checks, phone pads, and both diagonals.",
    ritual:"Write permutations with a used set — no peeking.",
    probs:[
      { id:"lcp", n:"Letter Combinations of a Phone Number", slug:"letter-combinations-of-a-phone-number", diff:"M" },
      { id:"pp",  n:"Palindrome Partitioning", slug:"palindrome-partitioning", diff:"M" },
      { id:"nq",  n:"N-Queens", slug:"n-queens", diff:"H" },
      { id:"tkf", n:"Top K Frequent Elements", slug:"top-k-frequent-elements", diff:"M", warm:true },
    ]},
  { id:"d4", d:4, stn:"Memo Bridge", color:"var(--yellow)", ph:"dp",
    name:"The pivot: DFS + cache = DP",
    note:"Yesterday's recursion with a dictionary bolted on. Same tree, no repeated work. This is the whole trick.",
    ritual:"Write the memoized-DFS shape: look up, base, recurse, store, return.",
    probs:[
      { id:"cs",   n:"Climbing Stairs", slug:"climbing-stairs", diff:"E" },
      { id:"mccs", n:"Min Cost Climbing Stairs", slug:"min-cost-climbing-stairs", diff:"E" },
      { id:"wb",   n:"Word Break", slug:"word-break", diff:"M" },
      { id:"kla",  n:"Kth Largest Element in an Array", slug:"kth-largest-element-in-an-array", diff:"M", warm:true },
    ]},
  { id:"d5", d:5, stn:"Tabulation Sq.", color:"var(--green)", ph:"dp",
    name:"1D DP, bottom-up",
    note:"Flip the recursion: what dp[i] means, the seeds, the fill order. Three decisions, then it's a for loop.",
    ritual:"Write bottom-up Climbing Stairs, then say Coin Change's recurrence out loud.",
    probs:[
      { id:"hr2",  n:"House Robber II", slug:"house-robber-ii", diff:"M" },
      { id:"cc",   n:"Coin Change", slug:"coin-change", diff:"M" },
      { id:"lis",  n:"Longest Increasing Subsequence", slug:"longest-increasing-subsequence", diff:"M" },
      { id:"trie", n:"Implement Trie (Prefix Tree)", slug:"implement-trie-prefix-tree", diff:"M", warm:true },
    ]},
  { id:"d6", d:6, stn:"Grid Gardens", color:"var(--green)", ph:"dp",
    name:"Grid DP — back where we started",
    note:"Grids again, but dp[r][c] looks up-left instead of flooding. Maximal Square is the farmer's field — this time you finish it.",
    ritual:"Write the 2D DP double loop with a padded first row and column.",
    probs:[
      { id:"up",   n:"Unique Paths", slug:"unique-paths", diff:"M" },
      { id:"mps",  n:"Minimum Path Sum", slug:"minimum-path-sum", diff:"M" },
      { id:"msq",  n:"Maximal Square", slug:"maximal-square", diff:"M" },
      { id:"lcs",  n:"Longest Common Subsequence (if time)", slug:"longest-common-subsequence", diff:"M" },
      { id:"dasw", n:"Design Add and Search Words", slug:"design-add-and-search-words-data-structure", diff:"M", warm:true },
    ]},
  { id:"d7", d:7, stn:"Interchange", color:"var(--blue)", ph:"mix",
    name:"Fusion + the clock",
    note:"Everything at once: trie + backtracking + pruning in one problem, a knapsack, then a timed mock. 25:00, no pauses, talk out loud.",
    ritual:"Write trie insert + search from memory.",
    probs:[
      { id:"ws2",  n:"Word Search II", slug:"word-search-ii", diff:"H" },
      { id:"pess", n:"Partition Equal Subset Sum", slug:"partition-equal-subset-sum", diff:"M" },
      { id:"mock", n:"Timed mock — random Google-tagged medium", url:"https://github.com/liquidslr/leetcode-company-wise-problems", diff:"M", xp:30 },
    ]},
];

/* Derived lookups. The ported literals above are never mutated — the reference
   hung a back-reference off each problem, which would make PLAN cyclic.

   Keyed by string rather than a union of the 28 known ids on purpose: these are
   read with ids off the persisted blob, which a stale export can populate with
   anything. Under noUncheckedIndexedAccess every lookup therefore has to admit
   it can miss, which is exactly the check a stale id needs. */
export const PROBS: Record<string, Problem> = {};
export const DAY_OF: Record<string, Day> = {};
PLAN.forEach((day) => day.probs.forEach((p) => { PROBS[p.id] = p; DAY_OF[p.id] = day; }));

export const TOTAL: number = PLAN.reduce((a, d) => a + d.probs.length, 0);
export const DIFFN: Record<Diff, string> = { E: "EASY", M: "MED", H: "HARD" };
export const probXP = (p: Problem): number => p.xp || XPD[p.diff];

/* Where a problem's ↗ goes. Every problem in the reference carries a slug or a
   url — only the Day-7 mock uses the latter — so the "" is unreachable. */
export const probURL = (p: Problem): string => p.url ?? (p.slug ? LC(p.slug) : "");
