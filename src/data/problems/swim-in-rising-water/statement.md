# Swim in Rising Water

## The task

`grid` is an `n x n` map of a valley: `grid[r][c]` is the elevation of cell `(r, c)`, and the `n * n` elevations are all different. Together they are exactly the numbers `0` to `n * n - 1`. Rain falls steadily, and at time `t` the water everywhere stands at height `t`.

You start in the top-left cell `(0, 0)` and want to reach the bottom-right cell `(n - 1, n - 1)`. Swimming takes no time. At time `t` you can cross any number of cells in one go, moving up, down, left or right, as long as every cell you touch, including the first and the last, has an elevation of at most `t`. Return the earliest time `t` at which the trip is possible.

## Examples

**Example 1**

```
grid = [[0,6,5],[1,8,4],[7,2,3]]   -> 6
```

Down the left side and along the bottom, you have to cross the `7`. Along the top and down the right side, `0 → 6 → 5 → 4 → 3`, nothing is higher than `6`. At `t = 6` that whole route is under water.

**Example 2**

```
grid = [[0,9,5,3,2],[19,23,17,18,7],[6,12,13,16,15],[8,20,24,21,22],[11,14,4,1,10]]   -> 16
```

The values `17` to `24` form two walls. Below `17`, the only way through is the corridor that runs right along the top, back left through the middle row, then right along the bottom. Its highest cell is `16`.

**Example 3**

```
grid = [[3,1],[2,0]]   -> 3
```

Both neighbours are low, but you can't leave the start until its own cell, at height `3`, is under water.

## Constraints

- `n == grid.length == grid[r].length`
- `1 <= n <= 30`
- `0 <= grid[r][c] < n * n`
- Every value in `grid` is different.

## Aim for

The answer is the smallest possible "highest cell" over all routes, both ends included. That's a minimax path, like Path With Minimum Effort but scored on cells instead of steps. Grow the reachable region from `(0, 0)` with a min-heap: always flood the lowest cell on its border, and track the highest cell flooded so far. When the target joins, that height is the answer: `O(n^2 log n)` time, `O(n^2)` space. Binary search on `t` with a BFS or DFS check is also `O(n^2 log n)`, and union-find adding cells in increasing elevation works too.

## Follow-ups

- Elevations may repeat and go up to `10^9`. What changes in each approach?
- Return the route, not just the time.
- Compute the earliest time for every cell of the grid as the target, in one pass.
