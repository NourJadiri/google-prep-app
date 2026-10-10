## Approach

Unbounded-knapsack counting. The whole difficulty is counting each combination **once**. If you build an amount by "which coin went last", `3+5` and `5+3` are two different builds. Fix an order on the denominations and only ever build a combination in that order: every combination then has exactly one build.

**Subproblem.** `ways[i][a]` = the number of combinations that use only the first `i` denominations and sum to `a`.

**Recurrence.** A combination either uses no copy of `c = coins[i-1]`, or it uses at least one. Take one copy away and what's left is a combination of the same first `i` denominations summing to `a - c`:

`ways[i][a] = ways[i-1][a] + ways[i][a - c]` (the second term only when `c <= a`).

**Base cases.** `ways[i][0] = 1` for every `i`: the empty combination. `ways[0][a] = 0` for `a > 0`: no coins can't make a positive amount.

**Fill order.** Row `i` reads row `i-1` in the same column and row `i` in an earlier column, so go denomination by denomination with amounts ascending. That needs only one row, overwritten in place from left to right. When the loop reaches `a`, `ways[a]` still holds the old row's value (`ways[i-1][a]`) and `ways[a - c]` already holds the new row's (`ways[i][a - c]`), which is exactly the recurrence. The ascending direction is what lets a coin be reused.

**Why the loop order matters.** Put amounts outside and coins inside, and `ways[a]` sums "the last coin is `c`" over every coin, so each ordering is counted separately. That's Combination Sum IV, a different problem.

**Top-down.** `ways(i, rem)` = combinations of `coins[i:]` summing to `rem`, which is `ways(i + 1, rem) + ways(i, rem - coins[i])`, with `ways(i, 0) = 1` and `ways(n, rem > 0) = 0`, memoised on `(i, rem)`. It has the same `O(n · amount)` states. But the recursion can run about `amount / min(coins)` calls deep, and each state costs a function call, so the one-row loop is both shorter and faster.

## Complexity

`O(n · amount)` time: each denomination sweeps the array once. `O(amount)` space for the single row.

## Pitfalls

- Swapping the loops (amounts outside) counts orderings: Example 1 gives 6 instead of 3.
- Running amounts downward lets each coin be used at most once. That's the 0/1 knapsack, not this problem.
- Seeding `ways[0] = 0`: then every count stays zero. The empty combination is what every other count grows from.
