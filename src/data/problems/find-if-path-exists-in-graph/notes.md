## Approach

**The pattern: graph reachability with BFS or DFS.** "Can I get from here to there?" is the most basic graph question, and the answer always takes the same two steps: store the graph so you can look up a node's neighbours quickly, then search outward from the start until you either find the target or run out of places to go.

**Step 1: an adjacency list.** The input is an *edge list*. That's fine for describing a graph but useless for walking it: finding one machine's neighbours would mean scanning every cable. So build `graph[u]`, the list of machines wired to `u`. A cable `[u, v]` works both ways, so it goes into both lists — `graph[u].append(v)` and `graph[v].append(u)`. Forget the second line and the network turns into one-way streets.

**Step 2: search, remembering where you've been.** Breadth-first search (BFS) keeps a queue of machines waiting to be visited:

1. Put `source` in the queue and in a `seen` set.
2. Take the machine at the front. If it's `destination`, the answer is `True`.
3. Otherwise, add each neighbour that isn't in `seen` to `seen` and to the back of the queue.
4. If the queue runs empty, every machine reachable from `source` has been visited and `destination` wasn't one of them: `False`.

The `seen` set is what makes this finish. Networks have loops (a ring, a triangle), and without it the search would go round them forever. Mark a machine when you *queue* it, not when you take it out, so it can never be queued twice.

**DFS works too.** Swap the queue for a stack — take from the end with `pop()` — and you get depth-first search (DFS): it follows one route as far as it goes before backing up. Recursion is the other way to write DFS (`visit(node)` marks `node`, then calls `visit` on each unseen neighbour), but in Python a long chain of machines means a very deep call stack, so on big graphs an explicit queue or stack is the safer habit. For a yes/no question, BFS and DFS do the same total work; BFS has the bonus of reaching every machine by a route with the fewest hops.

**Another tool: union-find.** Keep one "representative" per group of connected machines, and let every cable merge the groups at its two ends. Afterwards, `source` and `destination` are connected exactly when they share a representative. It shines when many questions are asked about the same network — just make sure `find` compresses paths as it goes, or the chains of representatives grow long and it crawls.

**Why it's correct.** BFS from `source` visits exactly the machines reachable from `source`. Everything it queues was reached along a cable from a machine it had already reached, so it never visits an unreachable machine. And every reachable machine does get queued: walk along its route from `source`, and the first machine on that route that never got queued would sit right next to one that was visited — which would have queued it. So `destination` is visited if and only if a route exists.

**Spotting it next time.** "Is there a path?", "can X reach Y?", "are these connected?", "same group?" — asked about things with pairwise links (people and friendships, cities and roads, machines and cables) — is graph reachability: build adjacency, then BFS or DFS with a seen set. The grid problems in this track are the same idea, with each cell's neighbours worked out on the fly instead of stored in a list.

## Complexity

`O(n + E)` time: building the adjacency list touches each cable twice, and the search handles each machine at most once and looks along each cable at most twice (once from each end). `O(n + E)` space for the adjacency list, the `seen` set and the queue.

## Pitfalls

- Recording each cable in one direction only. `[1, 0]` must also carry a message from `0` to `1`.
- Checking for `destination` only among a machine's *neighbours*. That misses `source == destination`, especially when that machine has no cables at all.
- No `seen` set, or marking too late: loops in the network keep the search running forever.
- Scanning the whole edge list to find each machine's neighbours. It's correct, but `O(n * E)` — far too slow at this size.
