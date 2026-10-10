## Approach

Grid path counting — the cleanest DP there is.

- **Subproblem:** `paths[r][c]` = the number of routes from `(0, 0)` to cell `(r, c)`.
- **Recurrence:** the last move into `(r, c)` came either down from `(r - 1, c)` or right from `(r, c - 1)`. Those two groups of routes don't overlap (their last moves differ) and together they cover every route, so `paths[r][c] = paths[r - 1][c] + paths[r][c - 1]`.
- **Base cases:** every cell of the top row and of the left column has exactly one route — all rights, or all downs. `paths[0][0] = 1` is the empty route.
- **Fill order:** row by row, left to right, so both cells a value depends on are already done. The answer is `paths[m - 1][n - 1]`.

**One row is enough.** Row `r` reads only row `r - 1`. Keep a single array `row` of length `n`, initialised to all 1s (the top row). For each further row, sweep `c` from 1 to `n - 1` doing `row[c] += row[c - 1]`: just before the update, `row[c]` still holds the value from the row above, and `row[c - 1]` has already become this row's value — exactly the two terms of the recurrence. `row[0]` stays 1, the left column.

**Top-down:** `count(r, c) = count(r - 1, c) + count(r, c - 1)`, with `count` equal to 1 on the top row and the left column, under `@cache`. Without the cache this recursion visits every route individually — roughly `2 · answer` calls, which is billions on the larger tests.

**Closed form.** Every route is exactly `m - 1` downs and `n - 1` rights, and every arrangement of them is a valid route. So the answer is the number of ways to choose which of the `m + n - 2` moves are the downs: `C(m + n - 2, m - 1)`, which `math.comb` computes directly. Worth saying in an interview — but the DP is what generalises to obstacles, weights and other move sets.

## Complexity

DP: `O(m · n)` time and `O(n)` space with the single row (iterate over the longer side to keep the row short, if memory matters). Closed form: `O(min(m, n))` multiplications.

## Pitfalls

- Mixing up cells and moves: an `m × n` grid needs `m - 1` downs, not `m`. Counting on an `(m + 1) × (n + 1)` lattice by mistake gives `C(m + n, m)`.
- Starting the loops at row 1 and column 1 but initialising the table with zeros: the top row and left column stay 0, and so does everything built from them.
- Plain recursion without memoisation.
