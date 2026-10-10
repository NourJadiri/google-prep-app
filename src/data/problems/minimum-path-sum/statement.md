# Minimum Path Sum

## The task

`grid` is an `m × n` grid of non-negative integers. Start on the top-left cell and finish on the bottom-right cell, moving one cell **right** or one cell **down** at each step. A route costs the sum of every cell it visits, including the first and the last. Return the smallest possible cost.

## Examples

**Example 1**

```
grid = [[1,1,7],[4,8,9],[1,1,1]]   -> 8
```

Down the left edge and along the bottom: `1 + 4 + 1 + 1 + 1 = 8`. Stepping to the cheaper neighbour every time starts with the `1` on the right and ends up paying 19.

**Example 2**

```
grid = [[4,0,7,1]]   -> 12
```

One row means one route, and it visits every cell.

**Example 3**

```
grid = [[5]]   -> 5
```

The start is also the finish, and its cost is paid once.

## Constraints

- `m == grid.length` and `n == grid[i].length`
- `1 <= m, n <= 200`
- `0 <= grid[i][j] <= 200`

## Aim for

Greedy isn't safe (Example 1). Every route reaches `(r, c)` from above or from the left, so the cheapest cost into `(r, c)` is `grid[r][c] + min(cost above, cost to the left)`; the top row and the left column each have a single way in. Fill row by row in `O(m · n)` time, keeping one row of `n` running costs — or overwrite `grid` itself if you're allowed to.

## Follow-ups

- Return the route, not just its cost.
- Some cells may be negative. Does the DP still work?
- The robot may move in all four directions. Why is that a shortest-path problem (Dijkstra) rather than a table fill?
