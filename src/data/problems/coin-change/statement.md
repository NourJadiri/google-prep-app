# Coin Change

## The task

You have an unlimited supply of coins of every denomination in `coins`. Return the smallest number of coins whose values add up to exactly `amount`, or `-1` if no combination of coins adds up to it.

An `amount` of `0` needs no coins at all, so its answer is `0`.

## Examples

**Example 1**

```
coins = [1,6,10], amount = 12   -> 2
```

Two 6s. Paying with the biggest coin first gives `10 + 1 + 1` — one coin too many.

**Example 2**

```
coins = [4,6], amount = 15   -> -1
```

Any mix of 4s and 6s adds up to an even number, so 15 is out of reach.

**Example 3**

```
coins = [7], amount = 0   -> 0
```

## Constraints

- `1 <= coins.length <= 12`
- `1 <= coins[i] <= 2^31 - 1`
- `0 <= amount <= 10^4`

## Aim for

Say why greedy fails (Example 1), then build a table. Let `dp[a]` be the fewest coins that make exactly `a`: `dp[0] = 0`, and `dp[a] = 1 + min(dp[a - c])` over the coins `c <= a` — whichever coin is paid last, the rest must be an optimal way to make `a - c`. Fill `a` upward; amounts nothing can reach stay at a sentinel and become `-1`. `O(amount · len(coins))` time, `O(amount)` space. The same recurrence run as plain recursion, with no memo, is exponential.

## Follow-ups

- Count the combinations that make `amount` instead (Coin Change II). Why does the loop order suddenly matter?
- Return the coins themselves, not just how many.
- Each coin may be used at most once. What changes in the table?
- For which coin systems is greedy always optimal?
