## Approach

Multi-source BFS. Asking "how far is the nearest exit?" from every open cell is one search per cell. Turn it around: start the search from all the exits at once. Put every exit in the queue at distance `0`, then run an ordinary BFS. The queue holds the cells in rings — every distance-`d` cell is dequeued before any distance-`d + 1` cell — so the first ring that touches an open cell comes from its nearest exit, whichever exit that is.

That makes the update rule tiny: when a dequeued cell `(r, c)` has an open neighbour, set the neighbour to `rooms[r][c] + 1` and enqueue it. The value `2147483647` doubles as the "not visited yet" mark, so no separate visited set is needed — a cell is written exactly once, and a written cell is never revisited, because any later ring could only offer a distance at least as long. Racks are never entered, and open cells no ring reaches keep `2147483647`, as required.

Why it's correct: think of one imaginary super-exit joined to every real exit by a free edge. BFS from that single source computes shortest distances, and seeding the queue with all the exits is exactly the first step of that search.

## Complexity

`O(m·n)` time: every cell enters the queue at most once and looks at four neighbours. `O(m·n)` space for the queue in the worst case (all exits, or a large open floor).

## Pitfalls

- One search per exit that only fills still-open cells: the first exit grabs rooms that are closer to a later one. Searching per exit only works if you also overwrite cells when you find a shorter distance — and then it's `O(exits · m·n)`.
- One search per open cell: correct, but `O((m·n)^2)` — hopeless on a 250 x 250 floor.
- DFS instead of BFS: depth-first order reaches cells along long detours first, so it needs the "overwrite if shorter" rule, can redo work many times, and recurses as deep as the longest path (tens of thousands of frames here).
