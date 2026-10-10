# Number of Islands

## The task

You're given a map as an `m x n` grid `grid` of one-character strings: `"1"` is land and `"0"` is water. Two land cells belong to the same island when they share an edge — up, down, left or right. Cells that touch only at a corner are **not** connected. Everything outside the grid is water.

Return the number of islands.

You may modify `grid` while you work.

## Examples

**Example 1**

```
grid = [["1","1","0","1","1"],
        ["1","0","0","0","1"],
        ["1","0","1","0","1"],
        ["0","0","0","1","1"]]   -> 3
```

The hook on the left, the lone cell in the middle, and the shape on the right, which curls back along the bottom row — still one island.

**Example 2**

```
grid = [["1","0","1"],
        ["0","1","0"],
        ["1","0","1"]]   -> 5
```

The land cells touch only at corners, so each one is its own island.

**Example 3**

```
grid = [["0","0","0"],
        ["0","0","0"]]   -> 0
```

No land, no islands.

## Constraints

- `m == grid.length`, `n == grid[i].length`
- `1 <= m, n <= 300`
- `grid[i][j]` is `"0"` or `"1"`

## Aim for

`O(m·n)` time. Scan the grid. When you reach land you haven't visited yet, you've found a new island: count it, then flood the whole island (DFS or BFS) so it's never counted again. Turning visited cells into `"0"` doubles as the visited set. Be ready to say what a recursive flood costs in call-stack depth, and how an explicit stack or a queue avoids that cost.

## Follow-ups

- Return the area of the largest island instead.
- Land appears one cell at a time, and you must report the island count after each addition. What structure handles that?
- The map is too big for memory and arrives one row at a time. What must you keep between rows?
