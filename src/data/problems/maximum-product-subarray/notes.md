## Approach

**Why plain Kadane fails.** For sums, the best subarray ending at `i` either extends the best one ending at `i - 1` or starts fresh. For products that's false: multiplying by a negative flips the order, so the *smallest* (most negative) product ending at `i - 1` can become the *largest* one ending at `i`. In `[2, -5, -2]`, the best product ending at `-5` is `-5`, but the one that matters next is `2 · -5 = -10`, which the `-2` turns into `20`.

**Track both extremes.**

- **Subproblem:** `hi[i]` and `lo[i]` = the largest and the smallest product of a subarray that ends exactly at index `i`.
- **Recurrence:** a subarray ending at `i` is either `nums[i]` alone or a subarray ending at `i - 1` extended by `x = nums[i]`. Among the extensions, `x · p` is largest when `p` is the largest possible product (if `x >= 0`) or the smallest (if `x < 0`), and symmetrically for the minimum. So `hi[i] = max(x, x · hi[i-1], x · lo[i-1])` and `lo[i] = min(x, x · hi[i-1], x · lo[i-1])`.
- **Base case:** `hi[0] = lo[0] = nums[0]`.
- **Fill order:** left to right. The answer is the largest `hi[i]` seen anywhere.

Each step reads only the previous pair, so two variables replace both arrays — as long as the new pair is computed from the *old* values. The reference builds the three candidates first and assigns `hi, lo = max(...), min(...)` together. (An equivalent trick: when `x < 0`, swap `hi` and `lo` first; then `hi = max(x, hi · x)` and `lo = min(x, lo · x)`.)

Zeros need no special case: the candidate `x` alone resets both values to 0, and the next element starts fresh.

**Prefix/suffix alternative.** With integers, every non-zero factor has `|x| >= 1`, so inside a zero-free stretch a longer subarray never has a smaller absolute product. The best subarray is therefore a prefix or a suffix of some zero-free stretch — if the stretch has an odd number of negatives, drop everything up to the first one or from the last one. So: scan left to right with a running product, take the max, reset to 1 after a zero; repeat right to left. Also `O(n)` time and `O(1)` space.

This is a scan, not a search: a top-down memo would recurse `n` deep for nothing.

## Complexity

`O(n)` time — one pass, three multiplications per element. `O(1)` extra space.

## Pitfalls

- Tracking only the maximum (plain Kadane): two negatives multiply into a positive the maximum never saw coming.
- Updating `hi` first and then computing `lo` from the *new* `hi`.
- Starting `best` at 0: `[-4]` must return `-4`.
