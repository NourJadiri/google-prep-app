# Maximal Square

## The task

`matrix` is an `m × n` grid whose cells are the one-character strings `"0"` and `"1"`. Find the largest square block of cells — sides parallel to the grid — in which every cell is `"1"`, and return its **area**, the number of cells it covers. If the grid has no `"1"` at all, return `0`.

The cells are strings, not integers: compare with `"1"`, not `1`.

## Examples

**Example 1**

```
matrix = [["1","1","1","0"],["1","1","1","1"],["1","1","1","1"],["0","1","1","1"]]   -> 9
```

There are two 3 × 3 blocks of ones (top-left and bottom-right) but no 4 × 4 one: two corners hold zeros.

**Example 2**

```
matrix = [["1","1","1","1","1"],["1","1","1","1","1"]]   -> 4
```

The whole grid is ones, but it's only 2 rows tall, so the biggest square is 2 × 2. Return its area, 4.

**Example 3**

```
matrix = [["0","1"],["1","1"]]   -> 1
```

Three ones in an L don't make a 2 × 2 square: the top-left cell is missing.

## Constraints

- `m == matrix.length` and `n == matrix[i].length`
- `1 <= m, n <= 300`
- Every `matrix[i][j]` is `"0"` or `"1"`.

## Aim for

Let `side[i][j]` be the side of the largest all-ones square whose **bottom-right** corner is `(i, j)`. For a `"1"` it's `1 + min(side above, side to the left, side up-left)` — whichever of those three squares is smallest limits how far this one can grow; for a `"0"` it's 0. One pass, `O(m · n)` time, two rows of memory (or one row plus a saved diagonal). Return the largest side, squared.

## Follow-ups

- Count every all-ones square in the grid (Count Square Submatrices with All Ones) — the same table, summed.
- Find the largest all-ones *rectangle* instead (Maximal Rectangle).
- Return where the square is, not just its area.
