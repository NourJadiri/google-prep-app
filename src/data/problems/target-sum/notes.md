## Approach

**Direct DP over running totals.** Assign signs left to right. After the first `i` numbers, all the future cares about is the running total so far.

- **Subproblem:** `ways[i][s]` = the number of sign patterns for the first `i` numbers whose total is `s`.
- **Recurrence:** the `i`-th number `x` was either added or subtracted: `ways[i][s] = ways[i-1][s - x] + ways[i-1][s + x]`.
- **Base case:** `ways[0][0] = 1` — the empty pattern totals 0.
- **Fill order:** `i` from 1 to `n`. The answer is `ways[n][target]`, or 0 if that total never appears.

Totals range over `[-sum, sum]`, so either shift the index by `sum` or keep a dictionary from total to count, rebuilt number by number: `O(n · sum)` time.

Top-down, the same thing is `count(i, s)` = the patterns for `nums[i:]` that take a running total of `s` to `target`: `count(n, s)` is 1 if `s == target` and 0 otherwise, and `count(i, s) = count(i + 1, s + x) + count(i + 1, s - x)` under `@cache`. It's at most `n` frames deep. Without the cache it's exactly the `2^n` brute force.

**The subset-sum transform** — what the reference does. Call the plus-signed numbers `P` and the rest `N`. Then `P - N = target` and `P + N = total`, so `P = (total + target) / 2`. Each sign pattern corresponds to exactly one subset (its plus group) and vice versa, so the answer is *the number of subsets that sum to `(total + target) / 2`*.

Check that this number exists before counting: `total + target` must be even (flipping one sign changes the total by `2x`, so its parity never changes), and `|target| <= total`. Otherwise return 0.

What's left is counting 0/1 knapsack:

- **Subproblem:** `ways[s]` = the number of subsets of the numbers seen so far that sum to `s`.
- **Recurrence:** for each new `x`, do `ways[s] += ways[s - x]` for `s` from `goal` **down** to `x` — downward so that `ways[s - x]` still counts subsets *without* `x`, exactly as in Partition Equal Subset Sum.
- **Base case:** `ways[0] = 1`, the empty subset. The answer is `ways[goal]`.

Zeros come out right by themselves: with `x = 0` the loop runs `ways[s] += ways[s]` for every `s` down to 0, doubling each count — that's `+0` versus `-0`. It's also why the loop must include `s = x`.

The transform halves the range of sums and works on a flat array, so it's the faster of the two in practice; both are `O(n · total)`.

## Complexity

`O(n · total)` time — at most `50 · 1000` updates. `O(total)` space for the array. Counts can reach `2^50`; Python's integers don't mind.

## Pitfalls

- Skipping the parity check: `(total + target) // 2` rounds an impossible target down to a reachable one (`[3,4]` with target 2 counts the subset `{4}`).
- Skipping the range check: a negative `goal` turns into a negative index, and Python silently reads from the end of the list.
- Stopping the inner loop at `s > x`: zeros stop doubling, and `ways[x] += ways[0]` is skipped for every other number too.
- Sweeping upward, which lets one number join a subset twice.
