# Island Perimeter

## The task

A map is a grid of square cells, each 1 unit on a side. `grid[r][c]` describes cell `(r, c)`: `1` is land and `0` is water. Everything beyond the edge of the grid is water too.

The land cells form exactly one island: from any land cell you can reach every other by stepping up, down, left or right through land (cells that touch only at a corner aren't connected). The island has no lakes: every water cell in the grid can reach the edge of the grid by stepping up, down, left or right through water.

Return the length of the island's coastline — the number of unit cell sides that have land on one side and water (or the outside of the map) on the other.

## Examples

**Example 1**

```
grid = [[1,1,1],[0,1,0]]   -> 10
```

Walk around the T: 3 sides along the top, 1 at each end of the bar, 1 under each end of the bar, and 3 around the stem. `3 + 2 + 2 + 3 = 10`.

**Example 2**

```
grid = [[1,1],[1,1]]   -> 8
```

There's no water inside the map at all; the coastline runs along the map's own border, 2 sides per edge.

**Example 3**

```
grid = [[1,1,1],[1,0,1],[1,0,1]]   -> 16
```

The two water cells form a bay that opens to the sea along the bottom edge, so its shore is coastline: 5 sides around the bay, plus 11 along the outside.

## Constraints

- `rows == grid.length`, `cols == grid[i].length`
- `1 <= rows, cols <= 100`
- `grid[r][c]` is `0` or `1`.
- There is exactly one island, and it has no lakes.

## Aim for

You don't need to trace the coastline in order. Look at one land cell at a time: which of its four sides are coastline, and how can you tell from the cell next door? Add those up over the whole map — `O(rows * cols)` time, `O(1)` extra space. A DFS over the island that counts every step into water or off the map reaches the same total; try both.

## Follow-ups

- The map can hold several islands. Return the perimeter of the largest one.
- Lakes are allowed now, and a lake's shore shouldn't count. How do you tell lake water from sea water?
- The map is too big for memory and arrives one row at a time. Can you still compute the perimeter, and what do you need to remember between rows?
