## Approach

The direct approach asks, for every cell, "where can rain from here go?" and runs a downhill search from each one. That's up to `m·n` searches of up to `m·n` cells each. On flat ground, each search really does cover the whole flat area.

Reverse the question. Instead of following water down from every cell, start at the ocean and ask which cells could have sent water there. Rain flows from `a` to a neighbour `b` when `height[b] <= height[a]`. So, walking backwards from `b`, you may step to `a` exactly when `height[a] >= height[b]`: uphill or level. Every cell on the Pacific shore drains into the Pacific. So seed one search with the whole top row and left column, and spread uphill. Every cell the search reaches has a downhill path to the Pacific (the search's own path, reversed). Every cell it misses has none. This is a **multi-source** search: all the sources start in the queue together, and each cell is marked once, however many sources could reach it.

Run the same search from the Atlantic shore (the bottom row and right column). The answer is the intersection of the two marked sets.

BFS or DFS? Here we only need reachability, not distances, so the order doesn't matter and either works. Mark each cell when it's first discovered (on push), so nothing is queued twice. The real difference is the stack. A recursive DFS on a big plateau can use one frame per cell: 40,000 deep on a flat 200 x 200 island. An iterative BFS with a `deque` (the reference) or an explicit stack has no such limit.

## Complexity

`O(m·n)` time. Each search marks each cell at most once and checks its four neighbours. `O(m·n)` space for the two marked sets and the queue.

## Pitfalls

- Comparing with `>` instead of `>=`. Water crosses flat ground: in Example 1, `[1,1]` reaches the Atlantic only across an equal-height step.
- Walking the wrong way. From the ocean, you move to cells that are higher or level, not lower.
- Mixing up `m` and `n` when building the shore lists. Test on a grid that isn't square.
- Sharing one visited set between the two oceans. Each ocean needs its own.
