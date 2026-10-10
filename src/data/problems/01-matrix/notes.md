## Approach

For a single cell, this is "shortest path to the nearest 0", and a BFS from that cell answers it. But one BFS costs `O(m·n)`, and running one from every `1` costs `O((m·n)^2)`. The trick is to search the other way: from all the zeros at once.

**Multi-source BFS.** Put every `0` in the queue with distance 0, then run an ordinary BFS. Pop a cell. Give each neighbour that hasn't been reached yet the popped cell's distance plus one, and queue it. The queue holds all the distance-0 cells, then all the distance-1 cells, and so on. So a cell is first reached from a neighbour that is one step closer to *some* zero, and that makes its distance correct. Each cell is set once, on its first visit, and never revised. The `-1` "not reached yet" marker doubles as the visited set.

It's the same idea as Rotting Oranges, where every rotten orange starts the clock together, and Walls and Gates, where every gate does.

**Two DP sweeps.** With no walls, the distance between two cells is just `|dr| + |dc|`, and a shortest path can make its vertical moves and its horizontal moves in any order. The first sweep goes top-left to bottom-right, taking `min(self, up + 1, left + 1)`. That finds every zero you can reach by moving only up and left. The second sweep goes bottom-right to top-left, taking `min(self, down + 1, right + 1)`, starting from the first sweep's values. That finishes every other direction. A zero up and to the right, for example, is picked up by the first sweep in the zero's column, then carried across the row by the second. It's `O(1)` extra space, but it relies on there being no walls. The BFS doesn't.

## Complexity

BFS: `O(m·n)` time, since every cell enters the queue once. `O(m·n)` space for the queue and the result. Two sweeps: `O(m·n)` time and `O(1)` extra space beyond the output.

## Pitfalls

- A BFS per cell is correct but quadratic, and the 10,000-cell tests won't finish.
- Running only one DP sweep. Zeros below or to the right are never seen.
- Starting the DP with a "far away" value that isn't far enough. In a 1 x 10,000 row, a distance can reach 9,999. `m + n` is always safe.
- Seeding the BFS from a single `0` instead of all of them.
