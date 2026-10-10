## Approach

At time `t` the usable cells are exactly those with elevation at most `t`, and the trip works when `(0, 0)` and `(n - 1, n - 1)` are connected through usable cells. So the answer is the **smallest possible maximum elevation along a route**, with both endpoints included: a minimax path.

**Flood from the start with a min-heap** (Dijkstra, or really Prim, in disguise). Keep a heap of cells on the border of the region you've reached, keyed by elevation, starting with `(0, 0)`. Repeatedly pop the lowest border cell, raise `level` to its elevation if it's higher, stop if it's the target, and push its unseen neighbours. This is exactly the order in which rising water would flood the region connected to the start.

Why `level` is the answer when the target pops:

- **Achievable.** Every cell popped so far has elevation at most `level`, and they form a connected region containing both corners. So a route that never goes above `level` exists.
- **Optimal.** Look at the moment `level` last went up, when a cell of exactly that height popped. Every cell on the border then was at least that high (it was the heap's minimum), and the target was still outside. Any route to the target has to cross that border somewhere, so no route stays below `level`.

Here a cell's key is its own elevation, which doesn't depend on how you reached it. So a cell can be marked seen when it's **pushed**, and the heap never holds stale entries. That's unlike Path With Minimum Effort, where the cost of entering a cell depends on which neighbour you came from.

**Binary search on `t`** is the other standard answer. "Can I make the trip at time `t`?" is monotone in `t` and costs one BFS or DFS, and `t` ranges over `[0, n^2 - 1]`. **Union-find** works too: add cells in increasing elevation, joining each one to its already-added neighbours, and the elevation at which the two corners first share a root is the answer.

## Complexity

`O(n^2 log n)` time: each of the `n^2` cells is pushed and popped once, at `O(log n^2) = O(log n)` per operation. `O(n^2)` space for the seen set and the heap.

## Pitfalls

- Forgetting the start cell's own elevation. You can't leave `(0, 0)` until it's under water (Example 3). The target's elevation counts too.
- Only moving right and down. The lowest route may wind back up or to the left (Example 2).
- Returning the elevation of the last cell popped instead of the running maximum. The final cell can be lower than a ridge you had to cross on the way.
