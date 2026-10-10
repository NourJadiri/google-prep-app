## Approach

Greedy is the instinct — a cashier pays with the largest coin that fits — and it's right for everyday currencies. It breaks as soon as the denominations are irregular: with `[1, 6, 10]` and 12, taking the 10 forces two 1s (three coins) while two 6s need only two. It can even miss that an answer exists: with `[5, 7]` and 10 it takes the 7, and the remaining 3 can't be paid. So every choice has to be considered — without paying exponentially for it.

**Optimal substructure.** Take any optimal way to pay `a` and remove one coin, worth `c`. What's left pays `a - c`, and it must be optimal for `a - c`: if a smaller way existed, swapping it in would beat the "optimal" way to pay `a`. So the best answer for `a` is one coin plus the best answer for `a - c`, for whichever `c` is best.

- **Subproblem:** `dp[a]` = the fewest coins that make exactly `a`, or "impossible".
- **Recurrence:** `dp[a] = 1 + min(dp[a - c])` over coins `c <= a`; if every such `dp[a - c]` is impossible, so is `dp[a]`.
- **Base case:** `dp[0] = 0`.
- **Fill order:** `a` from 1 up to `amount`, since each entry reads only smaller amounts. The answer is `dp[amount]`, with "impossible" turned into `-1`.

The sentinel is `amount + 1`: every coin is worth at least 1, so no real answer uses more than `amount` coins, and `amount + 1` behaves like infinity under both `min` and `+ 1`. (`float('inf')` works too, at the cost of mixing floats into the table.)

**Top-down:** `fewest(a)` is `0` for `a == 0`, otherwise `1 + min(fewest(a - c))` over the coins that fit, with `@cache`. Same states, same work. The recursion runs about `amount / min(coins)` deep — 10,000 frames with a 1-coin and the largest amount — which is a good reason to make bottom-up the default here.

**BFS view.** Treat amounts as nodes and paying a coin as an edge from `a` to `a - c`. The fewest coins is the shortest path from `amount` down to `0`, so breadth-first search with a visited set also works: same `O(amount · len(coins))` worst case, and it stops at the first level that reaches 0.

**Loop order.** For the minimum you may nest the loops either way — amounts outside and coins inside, or the reverse. That freedom disappears when you *count* combinations (Coin Change II): with coins on the outside each combination is counted once, while with amounts on the outside every ordering of the same coins is counted separately.

## Complexity

`O(amount · k)` time for `k = len(coins)` — at most `10^4 · 12` = 120,000 steps. `O(amount)` space; the table can't shrink much, because `dp[a]` may look back as far as the largest useful coin.

## Pitfalls

- Greedy, in any form.
- Using `-1` or `0` to mean "impossible" inside the table: `min` then prefers it. Keep a large sentinel and convert at the end.
- Forgetting that `amount = 0` answers `0`, not `-1`.
- Returning the sentinel itself (`amount + 1` or `inf`) instead of `-1`.
