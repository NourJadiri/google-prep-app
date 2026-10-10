## Approach

The brute force pairs every buy day with every later sell day: `O(n^2)`, about five billion pairs at the maximum size. The way out is to stop thinking about pairs.

**The pattern: one pass, carrying the best of the past.** Fix the sell day. If you sell on day `j`, the best day to have bought is simply the cheapest day before `j`. So walk forward once, keeping `lowest`, the cheapest price seen so far. On each day, `price - lowest` is the best profit from selling today. Keep the largest of those.

Tracing `[5,11,3,8,2]`:

```
price  5:  lowest 5,  selling today makes 0    best 0
price 11:  lowest 5,  selling today makes 6    best 6
price  3:  lowest 3,  selling today makes 0    best 6
price  8:  lowest 3,  selling today makes 5    best 6
price  2:  lowest 2,  selling today makes 0    best 6
```

Look at what happened at `3` and `2`: the lowest price changed, but the best answer didn't. A new low only helps sales that come *after* it.

**Why it works.** Every day gets considered as the sell day, and for each one the best possible buy day (the cheapest earlier day) is used. The best trade overall is the best of those. Starting `best` at `0` covers the "don't trade" option. Updating `lowest` before working out today's profit is harmless: on a day that sets a new low, today's profit comes out as `0`, which can never beat `best`.

**Spotting it next time.** When you want the best pair `i < j`, and the score splits into "something about `i`" and "something about `j`", sweep `j` from left to right and carry the best `i` seen so far in a single variable. It's the simplest form of dynamic programming, and Kadane's algorithm for Maximum Subarray makes the same move.

## Complexity

`O(n)` time: one pass. `O(1)` space: two variables.

## Pitfalls

- `max(prices) - min(prices)`: the lowest price can come after the highest one (Example 2).
- Buying at the lowest price overall and selling at the best price after it. The best trade can happen entirely before that low: in `[3,9,1,4]` the answer is `9 - 3 = 6`, not `4 - 1 = 3`.
- Letting the answer go negative when prices only fall. Not trading is always allowed, so the answer never drops below `0`.
