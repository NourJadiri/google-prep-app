# Minimum Falling Path Sum

## The task

You're given an `n × n` grid of integers, `matrix`. A **falling path** starts at any cell of the top row and moves down one row at a time until it reaches the bottom row. From cell `(r, c)` it may step to `(r + 1, c - 1)`, `(r + 1, c)` or `(r + 1, c + 1)`, straight down or diagonally, as long as it stays inside the grid. Columns don't wrap around.

The sum of a path is the total of the cells it visits. Return the smallest sum of any falling path.

## Examples

**Example 1**

```
matrix = [[4,3,2],[1,7,9],[7,3,2]]   -> 7
```

`3 → 1 → 3`. Starting from the smallest top cell, the `2`, the best you can do is `2 → 7 → 2 = 11`.

**Example 2**

```
matrix = [[-3,4],[5,-2]]   -> -5
```

Values can be negative: `-3 → -2`.

**Example 3**

```
matrix = [[-7]]   -> -7
```

A single cell is a path on its own.

## Constraints

- `n == matrix.length == matrix[i].length`
- `1 <= n <= 100`
- `-100 <= matrix[i][j] <= 100`

## Aim for

`O(n^2)` time and `O(n)` extra space. Let `best[c]` be the cheapest path ending in column `c` of the current row. A cell in the next row costs its own value plus the minimum of the (up to three) `best` entries above it. Go one row at a time, then take the minimum of the last row. Trying every path is `O(n·3^n)`.

## Follow-ups

- Return the path itself, not just its sum.
- Each step may go to *any* column of the next row except the current one. Can you still do it in `O(n^2)`?
- The grid is `m × n` with `m` much larger than `n`. What does each part of the cost depend on now?
