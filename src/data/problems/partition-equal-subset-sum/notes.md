## Approach

**Reduce it first.** If two groups have equal sums, each sums to exactly `total / 2`. So an odd total answers `False` at once, and otherwise the question becomes: *is there a subset that adds up to `target = total / 2`?* — whatever is left over then sums to `target` as well. That's subset sum, the decision version of the 0/1 knapsack.

**The 2D table.**

- **Subproblem:** `can[i][s]` = some subset of the first `i` numbers adds up to exactly `s`.
- **Recurrence:** the `i`-th number `x` is either left out or used: `can[i][s] = can[i-1][s] or (s >= x and can[i-1][s - x])`.
- **Base cases:** `can[0][0] = True` (the empty subset); `can[0][s] = False` for `s > 0`.
- **Fill order:** `i` from 1 to `n`. Within a row any order works, because row `i` reads only row `i - 1`. The answer is `can[n][target]`.

**Down to one row.** Since row `i` reads only row `i - 1`, keep a single array and update it in place — sweeping `s` from `target` *down* to `x`. Going downward, the `can[s - x]` you read hasn't been touched yet this round, so it still means "reachable without `x`". Going upward, `can[s - x]` may already have been set *using* `x`, so `x` gets counted twice: that's the unbounded knapsack (Coin Change's world), and `[2,2,3,5]` would "reach" 6 as `3 + 3`. You can also stop as soon as `can[target]` turns true.

**Top-down:** `fits(i, rem)` asks whether some subset of `nums[i:]` makes `rem`. It's `True` when `rem == 0`, `False` when `i == n` or `rem < 0`, and otherwise `fits(i + 1, rem - nums[i]) or fits(i + 1, rem)`, under `@cache`. At most `n · target` states and `n` frames of depth; the `or` stops as soon as one subset is found.

**Bitset.** Store the reachable sums as the bits of one Python integer: start with `bits = 1` (only sum 0), and for each `x` do `bits |= bits << x` — shifting adds `x` to every reachable sum at once. The answer is bit `target`. It's the same algorithm, but the inner loop runs in C over machine words, which makes it the fastest Python solution by a wide margin.

## Complexity

`O(n · target)` time with `target = total / 2 <= 10,000` — at most two million cheap steps. `O(target)` space for the single row. That's *pseudo-polynomial*: polynomial in the values rather than in the input's length, which is fine because the numbers are small.

## Pitfalls

- Sweeping the sums upward in the 1D version, which reuses numbers.
- Checking only that the total is even: `[2,2,3,5]` has total 12 and still can't split.
- Greedy balancing — largest number first, into the lighter group. `[3,3,2,2,2]` ends 7 against 5, though `{3,3}` and `{2,2,2}` work.
