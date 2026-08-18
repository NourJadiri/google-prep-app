// The 14-day plan. Week 1 (d1–d7) is ported verbatim from
// reference/onsite-express.html — do not rewrite, reword or reorder it.
// Week 2 (d8–d14) is hand-authored: Google-tagged patterns and problems from
// 2024–25 interview reports, each pattern day ramping easy in, hard out, with
// week-1 patterns re-drilled as the warm-ups. This file is no longer written
// by scripts/extract-data.mjs — regenerating would amputate the second week.

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
  { id:"d7", d:7, stn:"Interchange", color:"var(--blue)", ph:"mix", mock:true,
    name:"Fusion + the clock",
    note:"Everything at once: trie + backtracking + pruning in one problem, a knapsack, then a timed mock. 25:00, no pauses, talk out loud.",
    ritual:"Write trie insert + search from memory.",
    probs:[
      { id:"ws2",  n:"Word Search II", slug:"word-search-ii", diff:"H" },
      { id:"pess", n:"Partition Equal Subset Sum", slug:"partition-equal-subset-sum", diff:"M" },
      { id:"mock", n:"Timed mock — random Google-tagged medium", url:"https://github.com/liquidslr/leetcode-company-wise-problems", diff:"M", xp:30 },
    ]},
  { id:"d8", d:8, stn:"Priority Yard", color:"var(--red)", ph:"ds",
    name:"Heaps — the warm-ups grow up",
    note:"Every warm-up last week was secretly this station. The size-k invariant: keep k on the heap, evict from the root. When the input is a timeline, the heap is what pops the clock forward.",
    ritual:"Write from memory: a size-k top-k loop with heappushpop.",
    probs:[
      { id:"kcp",  n:"K Closest Points to Origin", slug:"k-closest-points-to-origin", diff:"M" },
      { id:"stc",  n:"Single-Threaded CPU", slug:"single-threaded-cpu", diff:"M" },
      { id:"fmd",  n:"Find Median from Data Stream", slug:"find-median-from-data-stream", diff:"H" },
      { id:"isl",  n:"Number of Islands", slug:"number-of-islands", diff:"M", warm:true },
    ]},
  { id:"d9", d:9, stn:"Window Seat", color:"var(--yellow)", ph:"mix",
    name:"Windows and pointers",
    note:"Fixed window first: one in, one out, O(1) a slide. Then the variable-window invariant — grow right greedily, shrink left only while broken. The deque is a window that remembers who can still win.",
    ritual:"Write the variable-window skeleton cold: grow right, while-broken shrink left, record.",
    probs:[
      { id:"maa",  n:"Maximum Average Subarray I", slug:"maximum-average-subarray-i", diff:"E" },
      { id:"lsub", n:"Longest Substring Without Repeating Characters", slug:"longest-substring-without-repeating-characters", diff:"M" },
      { id:"cmw",  n:"Container With Most Water", slug:"container-with-most-water", diff:"M" },
      { id:"swm",  n:"Sliding Window Maximum", slug:"sliding-window-maximum", diff:"H" },
      { id:"bts",  n:"Best Time to Buy and Sell Stock", slug:"best-time-to-buy-and-sell-stock", diff:"E", warm:true },
    ]},
  { id:"d10", d:10, stn:"Midpoint Halt", color:"var(--blue)", ph:"mix",
    name:"Binary search, off the sorted path",
    note:"The loop is the easy part; the invariant is the interview. Then stop searching the array and search the answer: 'can k work?' is a monotone yes/no — find the first yes.",
    ritual:"Write the lo < hi loop and say its invariant out loud before you run it.",
    probs:[
      { id:"bins", n:"Binary Search", slug:"binary-search", diff:"E" },
      { id:"fpe",  n:"Find Peak Element", slug:"find-peak-element", diff:"M" },
      { id:"koko", n:"Koko Eating Bananas", slug:"koko-eating-bananas", diff:"M" },
      { id:"sals", n:"Split Array Largest Sum", slug:"split-array-largest-sum", diff:"H" },
      { id:"gp",   n:"Generate Parentheses", slug:"generate-parentheses", diff:"M", warm:true },
    ]},
  { id:"d11", d:11, stn:"Timetable Sq.", color:"var(--green)", ph:"mix",
    name:"Intervals: sort, sweep, commit",
    note:"Sort by start, then one decision per interval: extend the last or push a new one. Rooms and machines are the same sweep with a heap of end times — yesterday's station buys today's hard one.",
    ritual:"Write Merge Intervals from memory — sort by start, extend or push.",
    probs:[
      { id:"smr",  n:"Summary Ranges", slug:"summary-ranges", diff:"E" },
      { id:"mi",   n:"Merge Intervals", slug:"merge-intervals", diff:"M" },
      { id:"ii",   n:"Insert Interval", slug:"insert-interval", diff:"M" },
      { id:"mr3",  n:"Meeting Rooms III", slug:"meeting-rooms-iii", diff:"H" },
      { id:"crs",  n:"Course Schedule", slug:"course-schedule", diff:"M", warm:true },
    ]},
  { id:"d12", d:12, stn:"Monotonic Mile", color:"var(--red)", ph:"ds",
    name:"Stacks that stay sorted",
    note:"A monotonic stack answers 'next greater' for everyone at once — pop the losers, charge each pop to its push. Water is the same walls, read sideways.",
    ritual:"Write Daily Temperatures cold — indices on the stack, while-pop before push.",
    probs:[
      { id:"vpar",  n:"Valid Parentheses", slug:"valid-parentheses", diff:"E" },
      { id:"dtemp", n:"Daily Temperatures", slug:"daily-temperatures", diff:"M" },
      { id:"mrvp",  n:"Minimum Remove to Make Valid Parentheses", slug:"minimum-remove-to-make-valid-parentheses", diff:"M" },
      { id:"trap",  n:"Trapping Rain Water", slug:"trapping-rain-water", diff:"H" },
      { id:"hr1",   n:"House Robber", slug:"house-robber", diff:"M", warm:true },
    ]},
  { id:"d13", d:13, stn:"Design Depot", color:"var(--yellow)", ph:"mix",
    name:"What Google actually asked",
    note:"Three regulars from the last year of interview reports. One trick underneath: pick the representation that makes the awkward operation cheap — a version list per index, a prefix-sum ruler, a greedy line builder.",
    ritual:"Sketch SnapshotArray's API and its per-index version lists before you code.",
    probs:[
      { id:"snap", n:"Snapshot Array", slug:"snapshot-array", diff:"M" },
      { id:"rpw",  n:"Random Pick with Weight", slug:"random-pick-with-weight", diff:"M" },
      { id:"tj",   n:"Text Justification", slug:"text-justification", diff:"H" },
      { id:"ws1",  n:"Word Search", slug:"word-search", diff:"M", warm:true },
    ]},
  { id:"d14", d:14, stn:"Final Approach", color:"var(--blue)", ph:"mix", mock:true,
    name:"Fusion, round two — then the clock",
    note:"A grid that is graphs and memo in one breath, a BFS you can do in your sleep by now, then 25:00 with a stranger's medium. Talk while you code, and state the complexity at the end without being asked.",
    ritual:"Write multi-source BFS from memory — seed every source, advance ring by ring.",
    probs:[
      { id:"ro",    n:"Rotting Oranges", slug:"rotting-oranges", diff:"M" },
      { id:"lip",   n:"Longest Increasing Path in a Matrix", slug:"longest-increasing-path-in-a-matrix", diff:"H" },
      { id:"mock2", n:"Timed mock — Google-tagged medium + follow-up", url:"https://github.com/liquidslr/leetcode-company-wise-problems", diff:"M", xp:30 },
    ]},
];

/* Derived lookups. The ported literals above are never mutated — the reference
   hung a back-reference off each problem, which would make PLAN cyclic.

   Keyed by string rather than a union of the 59 known ids on purpose: these are
   read with ids off the persisted blob, which a stale export can populate with
   anything. Under noUncheckedIndexedAccess every lookup therefore has to admit
   it can miss, which is exactly the check a stale id needs. */
export const PROBS: Record<string, Problem> = {};
export const DAY_OF: Record<string, Day> = {};
PLAN.forEach((day) => day.probs.forEach((p) => { PROBS[p.id] = p; DAY_OF[p.id] = day; }));

export const TOTAL: number = PLAN.reduce((a, d) => a + d.probs.length, 0);
export const DIFFN: Record<Diff, string> = { E: "EASY", M: "MED", H: "HARD" };
export const probXP = (p: Problem): number => p.xp || XPD[p.diff];

/* Where a problem's ↗ goes. Every problem carries a slug or a url — only the
   two timed mocks use the latter — so the "" is unreachable. */
export const probURL = (p: Problem): string => p.url ?? (p.slug ? LC(p.slug) : "");
