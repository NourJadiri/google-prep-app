## Approach

The signal reaches each node along its fastest route, so a node's arrival time is its **shortest-path distance** from `k`. The answer is the largest of those distances: the last node to hear the signal decides. With non-negative delays, that's exactly what **Dijkstra** computes.

Keep a min-heap of `(time, node)` candidates, starting with `(0, k)`. Pop the smallest time. If that node is already settled, the entry is stale: an earlier, faster entry already settled it, so skip it. Otherwise this time is final. Record it, and push `(time + w, v)` for every link `u -> v` to a node that isn't settled yet.

Why the popped time is final: every other candidate in the heap is at least as large, and links never subtract time. So any other route to this node would have to leave the heap later and could only arrive later. That's also why a node must be settled when it's **popped**, not when it's first pushed. The first push can come from a slow direct link while a faster detour is still being discovered (Example 1: node `2` is first pushed at `9`, but settles at `5`).

When the heap empties, fewer than `n` settled nodes means some node is unreachable, so return `-1`. Otherwise return the maximum settled time.

Leaving stale entries in the heap ("lazy deletion") is simpler than a decrease-key operation, and costs at most one heap entry per link.

## Complexity

`O(E log E)` time: each link pushes at most one entry, and each push or pop costs `O(log E)`. Since `E <= V^2`, that's also `O(E log V)`. `O(V + E)` space for the adjacency lists and the heap.

Bellman-Ford (relax every link `n - 1` times) is `O(V * E)`, which is fine at this size and handles negative delays. Dijkstra is the answer the interviewer wants.

## Pitfalls

- Marking a node done when it's first pushed, the BFS habit. In Dijkstra the first time you discover a node isn't necessarily its fastest.
- Plain BFS. It finds the route with the fewest links, not the least time.
- Summing the arrival times instead of taking the maximum, or treating links as two-way.
