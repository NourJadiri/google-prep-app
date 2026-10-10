## Approach

Start from a counting fact. Each cable can merge at most two pieces into one, so `n` switches need at least `n - 1` cables to end up connected — and a connected graph with exactly `n - 1` cables has no cable to spare, so it can't contain a cycle (removing any cable of a cycle would leave it connected with `n - 2`, which is impossible). Hence: **a graph is a tree exactly when it has `n - 1` edges and no cycle — equivalently, `n - 1` edges and connected.**

So reject anything that doesn't have exactly `n - 1` cables, then run union-find over the cables. Each cable `[a, b]` asks "are `a` and `b` already in the same component?" If yes, this cable closes a loop — not a tree. If no, union their components. If all `n - 1` cables go through without a loop, every one of them merged two components, taking `n` singletons down to exactly `1`: connected, so it's a tree.

A DFS or BFS from switch `0` works just as well once the count is right: it's a tree exactly when the search reaches all `n` switches. Without the count check, you'd need the search to detect cycles itself (a visited neighbour that isn't the node you came from).

## Complexity

`O(n + e · α(n))` time — the count check, then one near-constant `find` pair per cable (path halving here; add union by size for the formal `α` bound). `O(n)` space for the parent array. The DFS version is `O(n + e)` time and space for the adjacency lists.

## Pitfalls

- Checking only for cycles: a forest — Example 3 — has no cycle but isn't connected.
- Checking only the edge count: `n = 4, edges = [[0,1],[1,2],[2,0]]` has `n - 1` edges, a triangle and a stray switch.
- "Both endpoints already seen means a cycle" is not union-find: with `[[0,1],[2,3],[1,2]]` both ends of the last cable were seen, yet it joins two separate pieces into a tree.
- DFS cycle detection that forgets the edge back to the parent reports a cycle on every tree with a cable.
