# Pacific Atlantic Water Flow

## The task

An island is mapped as an `m x n` grid of integers `heights`, where `heights[r][c]` is the height of the cell in row `r`, column `c`. The Pacific Ocean touches the island's top and left edges; the Atlantic touches its bottom and right edges.

Rain that falls on a cell can flow into any edge-adjacent neighbour (up, down, left or right) whose height is **less than or equal to** its own, and keeps flowing by the same rule. A cell in the top row or the left column drains straight into the Pacific. A cell in the bottom row or the right column drains straight into the Atlantic. A corner cell can touch both.

Return the coordinates `[r, c]` of every cell from which rain can reach both oceans, in any order.

## Examples

**Example 1**

```
heights = [[2,3,1,3],
           [3,5,5,1],
           [5,6,6,3]]   -> [[0,3],[1,1],[1,2],[2,0],[2,1],[2,2]]
```

Look at `[1,1]`, height 5. It reaches the Pacific through the `3` above it. It reaches the Atlantic only by first crossing the equal `5` on its right, then dropping to the `1` on the right edge. `[0,2]` is a dip on the top row: it's in the Pacific already, but every neighbour is higher, so it can never reach the Atlantic.

**Example 2**

```
heights = [[4,1,7]]   -> [[0,0],[0,1],[0,2]]
```

In a single row, every cell is on both the top edge and the bottom edge.

**Example 3**

```
heights = [[5,5,5],
           [5,1,5],
           [5,5,5]]   -> [[0,0],[0,1],[0,2],[1,0],[1,2],[2,0],[2,1],[2,2]]
```

Rain runs freely along the flat rim to either coast. The pit in the middle is lower than everything around it, so water there goes nowhere.

## Constraints

- `m == heights.length`, `n == heights[r].length`
- `1 <= m, n <= 200`
- `0 <= heights[r][c] <= 10^5`

## Aim for

Simulating the rain from every cell costs `O((m·n)^2)`. Say so, then turn the search around: start at each ocean and walk **uphill**. Run one multi-source BFS (or DFS) seeded with the ocean's entire shore at once, stepping to neighbours that are at least as high. That marks every cell that drains into that ocean. Do it once per ocean; the answer is the cells marked by both. `O(m·n)` time and space.

## Follow-ups

- Return the cells that drain into exactly one ocean instead.
- Water can also flow diagonally. What changes?
- On a flat 200 x 200 island, how deep does a recursive DFS go, and what do you do about it?
