## Approach

Moves only go right or down, so the cells form a DAG that a row-by-row sweep visits in dependency order — exactly what a table needs.

- **Subproblem:** `best[r][c]` = the cheapest cost of a route from `(0, 0)` to `(r, c)`, counting both ends.
- **Recurrence:** the route's last step came from `(r - 1, c)` or from `(r, c - 1)`, and the part of the route before that step must itself be as cheap as possible — swap in a cheaper one and the total drops. So `best[r][c] = grid[r][c] + min(best[r - 1][c], best[r][c - 1])`.
- **Base cases:** `best[0][0] = grid[0][0]`. The top row and the left column have exactly one way in, so they're running sums along the edge.
- **Fill order:** row by row, left to right. The answer is `best[m - 1][n - 1]`.

**One row of memory.** Row `r` needs only row `r - 1`. Keep `best` of length `n`: when you reach column `c`, `best[c]` still holds the cost from the row above and `best[c - 1]` already holds this row's cost to the left. The reference starts `best` as `[0, inf, inf, …]`, so the first row needs no special case — `min(inf, left)` is just `left`. If you may modify the input, the same sweep works inside `grid` with `O(1)` extra space.

**Top-down:** `cheapest(r, c) = grid[r][c] + min(cheapest(r + 1, c), cheapest(r, c + 1))`, heading for the goal, with the borders handled and `@cache` — at most `m + n` frames deep. Without the cache it tries every one of the `C(m + n - 2, m - 1)` routes.

Why not greedy? A cheap next step can lead into an expensive region. The DP never commits to a step; it only records the cheapest way into each cell.

## Complexity

`O(m · n)` time — each cell is filled once from two neighbours. `O(n)` extra space for the row, or `O(1)` when overwriting `grid`.

## Pitfalls

- Padding the table with zeros so the first row and column "need no special case": a zero border is a free way in, and the edge cells forget everything paid before them. Pad with infinity instead, except for the one entry the start builds on.
- Greedy "step to the cheaper neighbour".
- Forgetting to count the first cell, or the last.
