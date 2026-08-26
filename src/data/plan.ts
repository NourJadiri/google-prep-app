// The line, 24 stations. Days 1–10 are ridden history — d1–d7 ported verbatim
// from reference/onsite-express.html, d8–d10 hand-authored and done; their
// problem ids key real progress in real exports, so never rename, reword or
// reorder them. Days 11–24 are the Google fortnight, rebuilt as multi-day arcs
// instead of one pattern a day: graphs for five days (BFS → components &
// union-find → topo order → Dijkstra → state graphs and the bitmask TSP), then
// DP for three (knapsack → strings → grids), hard trees for two, then the
// staples, a design day, and a final re-drill day. Easy in, hard out ACROSS an
// arc — a gentle day is allowed. Five problems a day; every day's last problem
// is a warm-up re-drilling an older pattern so nothing already learned rots,
// and several rituals resurrect old templates outright. Picks are
// cross-checked against liquidslr/leetcode-company-wise-problems' Google lists
// (30-day and 3-month CSVs — the same repo the timed mocks link to). Where a
// problem from the retired d11–d14 survives, it keeps its old id, so a tick
// made ahead of schedule still counts.
//
// The premium classics (Meeting Rooms II, Alien Dictionary, Graph Valid Tree,
// Walls and Gates, …) ride as in-app drills: original re-statements of the
// same tasks — own wording, own examples — served from public/drills and
// linked via url instead of slug. LeetCode's actual text is paywalled and none
// of it is copied here. This file is no longer written by
// scripts/extract-data.mjs — regenerating would amputate everything past d7.

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
    note:"Every warm-up last week was secretly this station. Feed counts through a heap and the scheduler falls out; two heaps facing each other pin the median; k sorted heads merge through one small heap.",
    ritual:"Write from memory: a size-k top-k loop with heappushpop.",
    probs:[
      { id:"tsch", n:"Task Scheduler", slug:"task-scheduler", diff:"M" },
      { id:"fmd",  n:"Find Median from Data Stream", slug:"find-median-from-data-stream", diff:"H" },
      { id:"mkl",  n:"Merge k Sorted Lists (if time)", slug:"merge-k-sorted-lists", diff:"H" },
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
  { id:"d11", d:11, stn:"Frontier Line", color:"var(--blue)", ph:"graphs",
    name:"BFS — the traversal you never met",
    note:"The graph arc opens. Week one flooded grids with DFS; interviews measure them with BFS. One queue, rings of distance: everything at depth k leaves before anything at k+1 boards, and seen is marked at push, never at pop. Multi-source is the same queue seeded with every source at once.",
    ritual:"Write the BFS skeleton cold — queue, seen-at-push, ring by ring. Dojo t8 checks you.",
    probs:[
      { id:"ff",   n:"Flood Fill", slug:"flood-fill", diff:"E" },
      { id:"paw",  n:"Pacific Atlantic Water Flow", slug:"pacific-atlantic-water-flow", diff:"M" },
      { id:"ro",   n:"Rotting Oranges", slug:"rotting-oranges", diff:"M" },
      { id:"spbm", n:"Shortest Path in Binary Matrix", slug:"shortest-path-in-binary-matrix", diff:"M" },
      { id:"wag",  n:"Walls and Gates (in-app drill)", url:"/drills/walls-and-gates.md", diff:"M" },
      { id:"csum", n:"Combination Sum", slug:"combination-sum", diff:"M", warm:true },
    ]},
  { id:"d12", d:12, stn:"Union Depot", color:"var(--red)", ph:"graphs",
    name:"Connected components, two ways",
    note:"Count islands in any disguise: DFS eats a component whole, union-find merges one edge at a time. Pick by verb — handed a static grid, flood it; edges arriving one by one, union them. A tree is the sparsest component going: n−1 edges, connected, nothing spare. Accounts Merge is Google's favourite way to hide a graph inside strings.",
    ritual:"Write union-find from memory — find with path compression, union, a components counter.",
    probs:[
      { id:"prov", n:"Number of Provinces", slug:"number-of-provinces", diff:"M" },
      { id:"gvt",  n:"Graph Valid Tree (in-app drill)", url:"/drills/graph-valid-tree.md", diff:"M" },
      { id:"accm", n:"Accounts Merge", slug:"accounts-merge", diff:"M" },
      { id:"isl2", n:"Number of Islands II (in-app drill, if time)", url:"/drills/number-of-islands-ii.md", diff:"H" },
      { id:"lsk",  n:"Longest Substring with At Most K Distinct (in-app drill)", url:"/drills/longest-substring-k-distinct.md", diff:"M", warm:true },
    ]},
  { id:"d13", d:13, stn:"Order Junction", color:"var(--yellow)", ph:"graphs",
    name:"Topological order — graphs with deadlines",
    note:"Prerequisites are edges, a valid schedule is a topo order, a cycle is the interviewer asking what breaks. Kahn's: indegrees in, zeroes queue up, pop and decrement. Alien Dictionary hides its edges between adjacent words — the premium crown jewel, re-stated in-app. Then Longest Increasing Path: the same DAG order, memoised instead of queued.",
    ritual:"Write Kahn's from memory — indegree array, zero-queue, pop-decrement-push — and say what a leftover node means.",
    probs:[
      { id:"crs",   n:"Course Schedule", slug:"course-schedule", diff:"M" },
      { id:"crs2",  n:"Course Schedule II", slug:"course-schedule-ii", diff:"M" },
      { id:"alien", n:"Alien Dictionary (in-app drill)", url:"/drills/alien-dictionary.md", diff:"H" },
      { id:"lip",   n:"Longest Increasing Path in a Matrix", slug:"longest-increasing-path-in-a-matrix", diff:"H" },
      { id:"kcl",   n:"K Closest Points to Origin", slug:"k-closest-points-to-origin", diff:"M", warm:true },
    ]},
  { id:"d14", d:14, stn:"Weighbridge", color:"var(--green)", ph:"graphs",
    name:"Dijkstra — BFS grows a priority queue",
    note:"Weights break the ring; the heap restores it. Always settle the cheapest frontier node, skip anything already seen — lazy deletion, dojo t11. The grid 'effort' problems are Dijkstra in a costume, and Cheapest Flights exists to show you exactly where the seen-set rule bends.",
    ritual:"Write Dijkstra's loop cold — heap of (dist, node), pop, skip stale, relax the neighbours.",
    probs:[
      { id:"ndt",  n:"Network Delay Time", slug:"network-delay-time", diff:"M" },
      { id:"pme",  n:"Path With Minimum Effort", slug:"path-with-minimum-effort", diff:"M" },
      { id:"cfk",  n:"Cheapest Flights Within K Stops", slug:"cheapest-flights-within-k-stops", diff:"M" },
      { id:"srw",  n:"Swim in Rising Water", slug:"swim-in-rising-water", diff:"H" },
      { id:"sra",  n:"Search in Rotated Sorted Array", slug:"search-in-rotated-sorted-array", diff:"M", warm:true },
    ]},
  { id:"d15", d:15, stn:"Dark Tunnels", color:"var(--blue)", ph:"graphs",
    name:"State graphs & the interview-sized TSP",
    note:"The nasty ones. A graph is whatever you can transition between: words a letter apart, lock wheels a click apart, (node, visited-mask) pairs. Shortest Path Visiting All Nodes is TSP in interview clothing — BFS over 2^n masks, because 'visit everything' needs the mask, never the order.",
    ritual:"Day 2's ritual, resurrected: the backtracking skeleton cold — for, append, recurse, pop. Ninety seconds now.",
    probs:[
      { id:"olock", n:"Open the Lock", slug:"open-the-lock", diff:"M" },
      { id:"wlad",  n:"Word Ladder", slug:"word-ladder", diff:"H" },
      { id:"spva",  n:"Shortest Path Visiting All Nodes", slug:"shortest-path-visiting-all-nodes", diff:"H" },
      { id:"bus",   n:"Bus Routes (if time)", slug:"bus-routes", diff:"H" },
      { id:"aup",   n:"Android Unlock Patterns (in-app drill)", url:"/drills/android-unlock-patterns.md", diff:"M", warm:true },
    ]},
  { id:"d16", d:16, stn:"Knapsack Wharf", color:"var(--red)", ph:"dp",
    name:"Choose or skip — the knapsack family",
    note:"The DP arc opens gently. Every knapsack is one sentence — for each item, take it or don't; the state is what's left. Target Sum is subsets wearing signs, Coin Change II counts order out by looping coins outside, Tickets is a knapsack over a calendar. Say the state before the loop.",
    ritual:"Say Coin Change II's loop order out loud — coins outer, amount inner — and why swapping them counts permutations instead.",
    probs:[
      { id:"tgt", n:"Target Sum", slug:"target-sum", diff:"M" },
      { id:"cc2", n:"Coin Change II", slug:"coin-change-2", diff:"M" },
      { id:"tix", n:"Minimum Cost For Tickets", slug:"minimum-cost-for-tickets", diff:"M" },
      { id:"psq", n:"Perfect Squares", slug:"perfect-squares", diff:"M" },
      { id:"ws1", n:"Word Search", slug:"word-search", diff:"M", warm:true },
    ]},
  { id:"d17", d:17, stn:"String Loom", color:"var(--yellow)", ph:"dp",
    name:"DP on strings — Google's favourite fabric",
    note:"Two indices in, a table out. Palindromes expand from centres, Decode Ways is Climbing Stairs with a lawyer, Edit Distance is the grid every string question secretly becomes. The regex is the boss fight: star means 'zero of me' or 'one more of me', and both branches must be written.",
    ritual:"Day 4's ritual, resurrected: the memoised-DFS shape — look up, base, recurse, store, return.",
    probs:[
      { id:"lps", n:"Longest Palindromic Substring", slug:"longest-palindromic-substring", diff:"M" },
      { id:"dw",  n:"Decode Ways", slug:"decode-ways", diff:"M" },
      { id:"ed",  n:"Edit Distance", slug:"edit-distance", diff:"M" },
      { id:"rem", n:"Regular Expression Matching", slug:"regular-expression-matching", diff:"H" },
      { id:"reo", n:"Reorganize String", slug:"reorganize-string", diff:"M", warm:true },
    ]},
  { id:"d18", d:18, stn:"Matrix Yard", color:"var(--green)", ph:"dp", mock:true,
    name:"Grid DP, second service — then the clock",
    note:"Rows fall and states ride along: Falling Path is Min Path Sum with diagonals, Cherry Pickup II is two walkers folded into one state — dp[row][c1][c2], nine transitions. Then 25:00 on a stranger's medium, talking the whole way. You know the drill; today the drill knows you.",
    ritual:"Day 6's ritual, back again: the 2D double loop with a padded first row and column. Still there?",
    probs:[
      { id:"mfp",   n:"Minimum Falling Path Sum", slug:"minimum-falling-path-sum", diff:"M" },
      { id:"cp2",   n:"Cherry Pickup II", slug:"cherry-pickup-ii", diff:"H" },
      { id:"mpc",   n:"Maximum Number of Points with Cost (if time)", slug:"maximum-number-of-points-with-cost", diff:"M" },
      { id:"zom",   n:"01 Matrix", slug:"01-matrix", diff:"M", warm:true },
      { id:"mock2", n:"Timed mock — random Google-tagged medium", url:"https://github.com/liquidslr/leetcode-company-wise-problems", diff:"M", xp:30 },
    ]},
  { id:"d19", d:19, stn:"Canopy Halt", color:"var(--blue)", ph:"graphs",
    name:"Trees — Google's home turf",
    note:"A tree question is a contract per node: what do I need from my children, what do I hand up. Right Side View is BFS keeping each ring's last; Validate BST hands bounds down; LCA bubbles answers up. Say the contract out loud before the code — that sentence is the interview.",
    ritual:"Day 1's ritual, back again: DFS collecting all root-to-leaf paths. It should take ninety seconds now.",
    probs:[
      { id:"dia",   n:"Diameter of Binary Tree", slug:"diameter-of-binary-tree", diff:"E" },
      { id:"rsv",   n:"Binary Tree Right Side View", slug:"binary-tree-right-side-view", diff:"M" },
      { id:"vbst",  n:"Validate Binary Search Tree", slug:"validate-binary-search-tree", diff:"M" },
      { id:"lca",   n:"Lowest Common Ancestor of a Binary Tree", slug:"lowest-common-ancestor-of-a-binary-tree", diff:"M" },
      { id:"tsum3", n:"3Sum", slug:"3sum", diff:"M", warm:true },
    ]},
  { id:"d20", d:20, stn:"High Branches", color:"var(--red)", ph:"graphs",
    name:"Hard trees: paths, wires, forests",
    note:"Max Path Sum is the child contract under pressure — gains clamp at zero, the answer lives at the bend. Serialize is preorder with the nulls spelled out; write it and its inverse as one pair. Robber III and the forest are tree DP: each node returns a small tuple of futures.",
    ritual:"Write serialize + deserialize as a pair from memory — preorder, null markers, an iterator to read back.",
    probs:[
      { id:"btmp", n:"Binary Tree Maximum Path Sum", slug:"binary-tree-maximum-path-sum", diff:"H" },
      { id:"ser",  n:"Serialize and Deserialize Binary Tree", slug:"serialize-and-deserialize-binary-tree", diff:"H" },
      { id:"hr3",  n:"House Robber III", slug:"house-robber-iii", diff:"M" },
      { id:"dnf",  n:"Delete Nodes and Return Forest", slug:"delete-nodes-and-return-forest", diff:"M" },
      { id:"ffl",  n:"Find First and Last Position of Element in Sorted Array", slug:"find-first-and-last-position-of-element-in-sorted-array", diff:"M", warm:true },
    ]},
  { id:"d21", d:21, stn:"Daily Bread", color:"var(--yellow)", ph:"ds",
    name:"The staples the line skipped",
    note:"The handshake questions — fumble these and nothing after matters. Two Sum is 'store the complement you still need'; Subarray Sum K is the same ledger holding prefix sums; intervals sort by start, then one decision each: extend the last or push a new one. Meeting Rooms II — the most Google-tagged premium problem there is, re-stated in-app — is that sweep plus a heap of end times.",
    ritual:"Day 9's ritual, resurrected: the variable-window skeleton — grow right, while-broken shrink left, record.",
    probs:[
      { id:"tsum", n:"Two Sum", slug:"two-sum", diff:"E" },
      { id:"mi",   n:"Merge Intervals", slug:"merge-intervals", diff:"M" },
      { id:"ii",   n:"Insert Interval", slug:"insert-interval", diff:"M" },
      { id:"mr2",  n:"Meeting Rooms II (in-app drill)", url:"/drills/meeting-rooms-ii.md", diff:"M" },
      { id:"ssk",  n:"Subarray Sum Equals K", slug:"subarray-sum-equals-k", diff:"M" },
      { id:"clg",  n:"Clone Graph", slug:"clone-graph", diff:"M", warm:true },
    ]},
  { id:"d22", d:22, stn:"Stack Overpass", color:"var(--green)", ph:"ds", mock:true,
    name:"Monotonic stacks — then the clock again",
    note:"A monotonic stack answers 'next greater' for everyone at once: pop the losers, charge each pop to its push. Decode String is a different stack — frames of (count, prefix). Water is the same walls read sideways, and a Google classic. Then 25:00, cold, on a stranger's medium.",
    ritual:"Write Daily Temperatures cold — indices on the stack, while-pop before push.",
    probs:[
      { id:"vpar",  n:"Valid Parentheses", slug:"valid-parentheses", diff:"E" },
      { id:"dtemp", n:"Daily Temperatures", slug:"daily-temperatures", diff:"M" },
      { id:"dstr",  n:"Decode String", slug:"decode-string", diff:"M" },
      { id:"trap",  n:"Trapping Rain Water (if time)", slug:"trapping-rain-water", diff:"H" },
      { id:"mock3", n:"Timed mock — Google-tagged medium, cold", url:"https://github.com/liquidslr/leetcode-company-wise-problems", diff:"M", xp:30 },
    ]},
  { id:"d23", d:23, stn:"Design District", color:"var(--red)", ph:"ds",
    name:"Design questions — O(1) or it didn't happen",
    note:"Google's fifth food group, and all five of today's are on its tagged lists. LRU is a hashmap holding hands with a doubly-linked list; GetRandom is swap-to-end-then-pop; Pick with Weight is binary search over a prefix ramp; the KV store is bisect over timestamps. State each operation's cost before you code — that is the question.",
    ritual:"Say LRU's two structures and why neither survives alone, then write get/put in pseudocode.",
    probs:[
      { id:"lru",   n:"LRU Cache", slug:"lru-cache", diff:"M" },
      { id:"idg",   n:"Insert Delete GetRandom O(1)", slug:"insert-delete-getrandom-o1", diff:"M" },
      { id:"rpw",   n:"Random Pick with Weight", slug:"random-pick-with-weight", diff:"M" },
      { id:"tbkv",  n:"Time Based Key-Value Store", slug:"time-based-key-value-store", diff:"M" },
      { id:"dhc",   n:"Design Hit Counter (in-app drill, if time)", url:"/drills/design-hit-counter.md", diff:"M" },
      { id:"mpsub", n:"Maximum Product Subarray", slug:"maximum-product-subarray", diff:"M", warm:true },
    ]},
  { id:"d24", d:24, stn:"Final Approach", color:"var(--blue)", ph:"mix", mock:true,
    name:"Re-drills, one mock, early night",
    note:"Nothing new today — that is the discipline. Three money patterns rewritten from a blank page, one last 25:00 against a Google-tagged medium, then close the laptop. Tomorrow you narrate: restate, example, brute force, invariant, code, complexity. Walk in like you own the whiteboard.",
    ritual:"Multi-source BFS one last time, then the big-five complexities out loud: BFS, Dijkstra, topo, backtracking, knapsack.",
    probs:[
      { id:"risl",  n:"Re-drill: Number of Islands", slug:"number-of-islands", diff:"M" },
      { id:"rcc",   n:"Re-drill: Coin Change", slug:"coin-change", diff:"M" },
      { id:"rcrs",  n:"Re-drill: Course Schedule", slug:"course-schedule", diff:"M" },
      { id:"mock4", n:"Timed mock — Google-tagged medium + follow-up", url:"https://github.com/liquidslr/leetcode-company-wise-problems/tree/main/Google", diff:"M", xp:30 },
    ]},
];

/* Derived lookups. The ported literals above are never mutated — the reference
   hung a back-reference off each problem, which would make PLAN cyclic.

   Keyed by string rather than a union of the 61 known ids on purpose: these are
   read with ids off the persisted blob, which a stale export can populate with
   anything. Under noUncheckedIndexedAccess every lookup therefore has to admit
   it can miss, which is exactly the check a stale id needs. */
export const PROBS: Record<string, Problem> = {};
export const DAY_OF: Record<string, Day> = {};
PLAN.forEach((day) => day.probs.forEach((p) => { PROBS[p.id] = p; DAY_OF[p.id] = day; }));

export const TOTAL: number = PLAN.reduce((a, d) => a + d.probs.length, 0);
export const DIFFN: Record<Diff, string> = { E: "EASY", M: "MED", H: "HARD" };
export const probXP = (p: Problem): number => p.xp || XPD[p.diff];

/* Where a problem's ↗ goes. Every problem carries a slug or a url — the timed
   mocks and the in-app premium drills use the latter — so the "" is
   unreachable. */
export const probURL = (p: Problem): string => p.url ?? (p.slug ? LC(p.slug) : "");
