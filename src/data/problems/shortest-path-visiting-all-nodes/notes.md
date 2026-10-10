## Approach

"Shortest" in an unweighted graph says BFS, but over *what*? A node alone isn't enough. Standing at node `3` having seen `{0, 1, 3}` is a different situation from standing there having seen everything. So the state has to carry what's been visited: **`(mask, node)`**, where bit `i` of `mask` records whether node `i` has been visited. There are `n * 2^n` states, at most 49,152 for `n = 12`, which is small enough to search completely.

From state `(mask, u)`, walking the edge `u – v` leads to `(mask | 1 << v, v)`. Every move costs one step, so plain BFS finds shortest distances. The walk may start anywhere for free, so seed the BFS with all `n` states `(1 << i, i)` at distance `0` (a multi-source BFS). Then expand layer by layer, marking states as seen when they're pushed. The first state whose mask has every bit set ends the search, and its layer number is the answer.

Why this state is exactly enough: the future of a walk depends only on where it stands and which nodes still need a visit, not on the order of the earlier visits. Two walks that reach the same `(mask, node)` have identical futures, so BFS can keep the first (shortest) one and drop the rest. That's the step that collapses `n!` orders into `2^n` subsets, the same collapse as the Held-Karp DP for the travelling salesman.

Revisits come for free. The same node appears in many states with different masks, which is how a walk passes back through a hub (Example 1).

## Complexity

`n * 2^n` states, each scanning the neighbours of its node: `O(2^n * n^2)` time in the worst case (every pair connected), about 590,000 steps at `n = 12`. `O(2^n * n)` space for the seen table and the queue.

## Pitfalls

- Starting only from node `0`. The best walk often starts at a leaf (Example 2).
- A seen set over nodes alone. BFS then never re-enters a node, so it can't walk back through a hub.
- Brute force over orderings (`n!`). Fine at `n = 8`, hopeless at `n = 12`.
