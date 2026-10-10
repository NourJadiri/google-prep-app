## Approach

**Subproblem.** `best[r][c]` = the highest score for rows `0..r` whose pick in row `r` is column `c`.

**Recurrence.** `best[r][c] = points[r][c] + max over k of (best[r-1][k] - |k - c|)`.

**Base case.** `best[0][c] = points[0][c]`, since there's no penalty before the first row.

**Fill order.** Row by row, and the answer is `max(best[m-1])`. Each row reads only the one before it, so keep a single row: `O(n)` space.

**The bottleneck.** Taken literally, the max over `k` costs `O(n)` per cell, `O(m·n^2)` in all: about 2.5 billion steps for a `2 × 50,000` grid. The fix is to get rid of the absolute value by splitting on which side of `c` the column `k` lies.

- `k <= c`: the term is `best[k] - (c - k)`. Define `from_left[c]` as its maximum over `k <= c`. Moving one column to the right costs every candidate one more point, so `from_left[c] = max(best[c], from_left[c-1] - 1)`: one left-to-right sweep.
- `k >= c`: symmetrically, `from_right[c] = max(best[c], from_right[c+1] - 1)`: one right-to-left sweep.

The new row is then `points[r][c] + max(from_left[c], from_right[c])`: three linear passes per row instead of a quadratic one. An equivalent way to see it: `best[k] - |k - c|` is `(best[k] + k) - c` for `k <= c` and `(best[k] - k) + c` for `k >= c`, so all you need are a prefix maximum of `best[k] + k` and a suffix maximum of `best[k] - k`.

**Top-down.** `go(r, c)` = the best score for rows `r..m-1` when row `r` picks column `c`, memoised. Each state still scans all `n` columns of the next row, so it's the `O(m·n^2)` version. The sweep is a bottom-up idea. Also, `m` can be `10^5` with a single column, far too deep to recurse.

## Complexity

`O(m·n)` time: three passes over each row. `O(n)` extra space for the current row and the two sweeps.

## Pitfalls

- Trying every column of the previous row: correct, but `O(m·n^2)`.
- Sweeping only from the left, so a good cell to the *right* in the row above is never considered.
- Taking each row's maximum greedily. The penalty can make a smaller value the better pick (Example 2).
