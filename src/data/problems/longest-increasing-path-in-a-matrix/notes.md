## Approach

From each cell, the best increasing path either stops right there, or takes one step to a strictly larger neighbour and continues with *that* neighbour's best path. So let `longest(r, c)` mean "the longest increasing path that starts at `(r, c)`". Then:

`longest(r, c) = 1 + max(longest(x, y))` over the neighbours `(x, y)` with a larger value, or `1` if there are none.

Computed naively, this recursion explores the same paths again and again. On the 200 x 200 staircase test there are astronomically many increasing paths. But `longest(r, c)` never changes. Every step is strictly uphill, so no path can return to a cell, and the answer for a cell doesn't depend on the path that led to it. The cells and their uphill steps form a **directed acyclic graph**, and that's what makes memoisation safe. Cache each cell's answer the first time you compute it, and every cell is computed exactly once.

That's also why there's no visited set. A visited set exists to stop cycles, and strictly increasing steps can't cycle. Worse, a flood-fill-style visited set ("never enter a cell twice") is *wrong* here. A later start may need to extend a path through a cell an earlier start already explored. The memo is what lets it reuse that work instead.

The same DAG gives an iterative solution: **topological peeling** with Kahn's algorithm. Give each cell an in-degree equal to its number of smaller neighbours. Queue every cell with in-degree 0 (the local minima). Then process the queue one layer at a time. Removing a cell decrements the in-degree of each larger neighbour, and any neighbour that reaches 0 joins the next layer. Each layer extends the longest path by one cell, so the number of layers is the answer. This version uses no recursion at all, which is worth offering when the interviewer asks about stack depth: a memoised DFS recurses as deep as the longest path.

## Complexity

`O(m·n)` time: each cell's answer is computed once, looking at four neighbours. `O(m·n)` space for the memo, plus recursion as deep as the longest path. Kahn's version needs a queue instead of the recursion.

## Pitfalls

- Forgetting the memo. The recursion is still correct, but exponential.
- Treating `>=` as increasing. Equal neighbours make the graph cyclic, and the recursion never ends.
- Using a flood-fill visited set instead of a memo of lengths. Cells explored from one start become dead ends for every later start.
- Filling a DP table in row-major order. A cell's larger neighbours can be anywhere, so their answers may not be ready yet. Order the work by value (or by DAG layer), not by position.
