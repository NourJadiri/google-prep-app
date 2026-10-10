## Approach

Every step costs the same (one cell), so the shortest path is the one with the fewest steps, and breadth-first search finds it. BFS explores the grid in rings. First comes the start (length 1), then every open cell one step away (length 2), then every open cell two steps away, and so on. Each cell is first discovered from a cell in the previous ring, so the length recorded at discovery is its true shortest length. When the goal is popped, its length is the answer. If the queue empties first, the goal can't be reached.

The mechanics:

- Check the start and the goal before anything else. A blocked start means there's no path at all.
- Queue `(row, col, length)` triples. Alternatively, process the queue one ring at a time and count rings.
- The neighbours are the eight cells `(r + dr, c + dc)` with `dr` and `dc` each in `{-1, 0, 1}`. The pair `(0, 0)` gives the cell itself, which is already visited.
- **Mark on push.** The reference writes `1` into the grid the moment it queues a cell, so no cell is queued twice. If you mark on pop instead, several neighbours in the same ring can queue the same cell. Then you must skip already-visited cells when you pop them, or the duplicates multiply ring after ring. Marking on push makes the whole question go away.

Why not DFS? DFS commits to one direction and goes deep, so the first path it finds to the goal is usually not the shortest. To make it find the shortest, it has to explore every path, which is exponential on an open grid.

Writing into `grid` saves you a `visited` set. That's normal on LeetCode-style problems. In an interview, say out loud that you're mutating the input, and use a set if that isn't allowed.

## Complexity

`O(n^2)` time: each cell is queued at most once and checks eight neighbours. `O(n^2)` space for the queue, plus a `visited` set if you use one instead of marking the grid.

## Pitfalls

- Not checking the start cell. A BFS launched from a blocked `[0, 0]` will happily find a path.
- Counting steps instead of cells. A 1 x 1 open grid has length 1, not 0.
- Moving in only four directions. Diagonal moves are legal, including between two blocked cells that touch at a corner.
- Marking visited on pop without skipping repeats. Duplicates pile up, and on an open 100 x 100 grid the queue explodes.
