## Approach

Two strings, so two indices: the classic two-sequence DP over prefixes.

- **Subproblem:** `dp[i][j]` = the length of the LCS of `text1[:i]` and `text2[:j]`.
- **Recurrence:** look at the last letters, `a = text1[i-1]` and `b = text2[j-1]`.
  - If `a == b`: `dp[i][j] = dp[i-1][j-1] + 1`.
  - If `a != b`: they can't both be the final letter of one common subsequence, so at least one goes unused: `dp[i][j] = max(dp[i-1][j], dp[i][j-1])`.
- **Base cases:** `dp[0][j] = dp[i][0] = 0` — an empty prefix shares nothing.
- **Fill order:** row by row, left to right, since each cell needs the cells above, to the left and up-left. The answer is `dp[m][n]`.

The match case deserves its one-line proof, because it's what interviewers probe: when the last letters are equal, pairing them is always safe. Take any optimal common subsequence of the two prefixes. If it already ends with this letter matched to these positions, done. Otherwise its last element uses at most one of the two final letters — so drop that element (if needed) and append the pair instead; the length doesn't shrink. Hence some optimal answer pairs the last letters, and the rest is an LCS of the shorter prefixes.

**Space.** Row `i` reads only row `i - 1`, so keep two rows; swapping the strings so the shorter one indexes the columns makes that `O(min(m, n))`. With a single row, save the old `dp[j - 1]` (the diagonal) before overwriting it. Keep the full table when you need the subsequence itself: walk back from `(m, n)`, stepping diagonally on a match and towards the larger neighbour otherwise.

**Top-down:** `lcs(i, j)` on suffixes — `0` past either end, `1 + lcs(i + 1, j + 1)` on a match, otherwise `max(lcs(i + 1, j), lcs(i, j + 1))` — under `@cache`. There are `m · n` states, and the recursion can go `m + n` deep. Without the cache it's exponential: every mismatch branches in two.

## Complexity

`O(m · n)` time — a quarter of a million cells at 500 × 500, a million at the limit. `O(min(m, n))` extra space with rolling rows; `O(m · n)` with the full table.

## Pitfalls

- On a match, adding 1 to `max(up, left)` instead of to the diagonal: a letter gets matched twice, and `"aa"` vs `"a"` comes out 2.
- Confusing it with longest common *substring*, which needs contiguous letters and resets to 0 on a mismatch.
- Greedily matching each letter of one string at the earliest spot in the other: `"zabc"` vs `"abcz"` grabs the `z` and ends with 1 instead of 3.
