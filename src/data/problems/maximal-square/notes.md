## Approach

Checking squares directly is expensive: `O(m · n)` corners, up to 300 sizes at each, and every check reads up to `size^2` cells. The DP reuses work by anchoring each square at its **bottom-right** corner.

- **Subproblem:** `side[i][j]` = the side length of the largest all-ones square whose bottom-right corner is `(i, j)`.
- **Recurrence:** if `matrix[i][j]` is `"0"`, `side[i][j] = 0`. Otherwise `side[i][j] = 1 + min(side[i-1][j], side[i][j-1], side[i-1][j-1])`.
- **Base cases:** squares ending in row 0 or column 0 have side at most 1. A border of zeros above and to the left gives that for free.
- **Fill order:** row by row, left to right, since each cell needs its neighbours above, to the left and up-left.
- **Answer:** the largest `side` anywhere, squared.

Why the minimum of three? Call the neighbours' values `a` (above), `b` (left) and `c` (up-left), and let `k = min(a, b, c)`. A `(k + 1) × (k + 1)` square ending at `(i, j)` is covered by the `k × k` square ending above, the one ending to the left, the one ending up-left, and the cell itself — every one of its cells lies in one of those. So the side is at least `k + 1`. It can't be `k + 2` or more: a square that big ending at `(i, j)` would contain a `(k + 1)`-square ending at whichever neighbour has value `k`, contradicting that value. The diagonal really matters: in `[["0","1"],["1","1"]]` the cells above and to the left both have side 1, but the up-left cell is a zero, so the answer stays 1.

**Memory.** Row `i` reads only row `i - 1` and the cell to its left, so two rows are enough — the reference keeps `prev` and `cur`. With a single row, save the old `side[j - 1]` (the diagonal) in a variable before it's overwritten.

**Top-down:** `side(i, j)` under `@cache`, returning 0 outside the grid or on a `"0"`, and otherwise `1 + min` of the three recursive calls; then take the max over all cells. The recursion is at most `m + n` deep.

## Complexity

`O(m · n)` time — one constant-time update per cell. `O(n)` extra space for two rows of length `n + 1`.

## Pitfalls

- Forgetting the diagonal neighbour: an L of three ones passes for a 2 × 2 square.
- Returning the side instead of the area.
- Comparing with the integer `1`: the cells are strings, `"1" == 1` is false, and every answer comes out 0.
