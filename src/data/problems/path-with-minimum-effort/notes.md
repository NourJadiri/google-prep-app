## Approach

Think of the grid as a graph: cells are nodes, and each pair of side-by-side cells is an edge weighted by their altitude difference. The task is a **minimax path**: a path whose largest edge is as small as possible. That's still a shortest-path problem, with "add the weight" replaced by "take the max".

**Dijkstra with max.** Keep `effort[r][c]`, the best hardest-step found so far for each cell, and a min-heap of `(effort, r, c)` starting from `(0, 0, 0)`. Pop the smallest entry. If it's stale (larger than the recorded effort), skip it. If it's the target, return it. Otherwise, for each neighbour, the effort of going there through this cell is `max(e, |height difference|)`. If that beats the neighbour's record, update the record and push.

Why popping settles a cell: extending a route can never make its hardest step smaller, because `max` never decreases, just as adding non-negative weights never shrinks a sum. Everything still in the heap is at least as large as the popped value, so no later route can improve on it. The cell's effort is final, and when the target pops, you're done.

The moves go in all four directions. A route sometimes has to double back up or to the left to stay on gentle ground (Example 2), so the right/down-only DP from "minimum path sum" is wrong here.

**Binary search on the answer** is the other classic. The question "is there a route using only steps of at most `x`?" is monotone in `x`, and a BFS or DFS answers it in `O(RC)`. Search `x` over `[0, 10^6]` for `O(RC log H)`. **Union-find** works too: add edges from easiest to hardest, and the weight that first joins the two corners is the answer (Kruskal's idea, `O(RC log(RC))` for the sort).

## Complexity

Dijkstra: `O(RC log(RC))` time, since each of the roughly `2RC` edges pushes at most one entry from each side. `O(RC)` space for the efforts and the heap.

## Pitfalls

- Only moving right and down. The best route may need to go up or left.
- Summing the differences. The route with the least total climbing can still contain one brutal step.
- Marking a cell final when it's first pushed instead of when it's popped. A gentler way in may still be on its way.
