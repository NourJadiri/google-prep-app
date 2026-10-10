# Path With Minimum Effort

## The task

You're planning a hike across a terrain map. `heights` is a `rows x cols` grid where `heights[r][c]` is the altitude of cell `(r, c)`. You start at the top-left cell `(0, 0)` and must reach the bottom-right cell `(rows - 1, cols - 1)`, moving one cell at a time up, down, left or right. No diagonal moves, and no stepping off the map. You may revisit cells.

The effort of a route is its single hardest step: the largest absolute altitude difference between two consecutive cells along it. Return the minimum effort of any route from start to finish.

## Examples

**Example 1**

```
heights = [[2,1,1],[5,9,1],[4,6,8]]   -> 3
```

Along the top row and down the right edge, no step is harder than `1` until the last one, from `1` to `8`, which makes the effort `7`. Going down the left side and along the bottom, `2 → 5 → 4 → 6 → 8`, never takes a step harder than `3`.

**Example 2**

```
heights = [[1,2,3,4],[50,50,50,5],[9,8,7,6],[10,50,50,50],[11,12,13,14]]   -> 1
```

The `50`s are cliffs. The gentle route snakes right, down, back left along the middle row, then down and right again. Every step changes altitude by `1`, but only if you're allowed to walk left.

**Example 3**

```
heights = [[7]]   -> 0
```

Start and finish are the same cell, so no steps are taken.

## Constraints

- `rows == heights.length` and `cols == heights[r].length`
- `1 <= rows, cols <= 30`
- `1 <= heights[r][c] <= 10^6`

## Aim for

A route's cost is its worst step rather than a sum, but Dijkstra still applies. Settle cells in increasing order of "hardest step so far", and relax a neighbour with `max(effort, |height difference|)` instead of `+`. The first time the target comes off the heap, that's the answer: `O(RC log(RC))`. Two alternatives are worth naming. You can binary search on the effort, checking each guess with a BFS or DFS that only takes steps up to the guess (`O(RC log H)`). Or you can sort the steps and union-find them from easiest to hardest until the two corners connect.

## Follow-ups

- Diagonal moves become legal. What changes in each of the three approaches?
- Return the route itself, not just its effort.
- Effort becomes the total climb, the sum of all the differences. Which approach still works, and which breaks?
