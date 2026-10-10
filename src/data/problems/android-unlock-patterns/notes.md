## Approach

Backtracking over paths. A path is valid exactly when every one of its prefixes is valid, so grow paths one dot at a time and count each path whose length lands in `[m, n]` as you pass it — there's no need to enumerate patterns separately per length.

From the current dot `d`, the next dot `x` is allowed when `x` is unused and either the move `d -> x` crosses no dot, or the dot it crosses is already used. Only eight segments (in both directions) pass through a dot centre: the three rows' ends (`1-3`, `4-6`, `7-9`), the three columns' ends (`1-7`, `2-8`, `3-9`) and the two long diagonals (`1-9`, `3-7`). A `skip` table records the middle dot for each, `0` for everything else — including the knight-like moves, which cross between dots rather than through one. Mark `d` used, recurse into each allowed `x`, unmark on the way back.

Then cut the work by symmetry. Rotating or reflecting the grid maps a valid pattern to a valid pattern of the same length (the skip relation is preserved), and those symmetries carry any corner onto any other corner and any edge dot onto any other edge dot. So the counts from `1`, `3`, `7` and `9` are equal, as are those from `2`, `4`, `6` and `8`: the answer is `4 · count(1) + 4 · count(2) + count(5)`.

## Complexity

The search visits each valid path once — at most `389,497` of them (all lengths `1..9`), each checking 9 candidates — so it is bounded by a constant independent of input size; symmetry divides the work by about three. Space is `O(9)` for the used-flags and the recursion stack.

The memoised version goes further: the number of ways to extend a path depends only on its last dot and the *set* of used dots, so caching on `(dot, used_mask)` collapses the search to `9 · 2^9` states.

## Pitfalls

- Forgetting the diagonals `1-9` and `3-7`, which cross `5`.
- Treating a move over a *used* dot as illegal too — the rule only blocks crossing a fresh dot.
- Blocking knight-like moves such as `1 -> 6`: they pass between dots, not through one.
- Counting lengths `m..n-1` or `m+1..n` — test with `m = n`.
- Multiplying the centre by 4 as well: there is only one centre.
