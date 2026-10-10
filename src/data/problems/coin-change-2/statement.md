# Coin Change II

## The task

A till holds an unlimited supply of coins of every denomination in `coins` (the values are distinct). Return how many different **combinations** of coins add up to exactly `amount`.

Two combinations are the same when they use the same number of each denomination — order doesn't matter, so `3 + 5` and `5 + 3` are one combination. An `amount` of `0` has exactly one combination: take no coins. If nothing adds up to `amount`, return `0`.

## Examples

**Example 1**

```
amount = 8, coins = [2,3,5]   -> 3
```

`2+2+2+2`, `2+3+3` and `3+5`.

**Example 2**

```
amount = 11, coins = [4,6,8]   -> 0
```

Every coin is even, so no combination reaches an odd amount.

**Example 3**

```
amount = 0, coins = [9]   -> 1
```

The empty combination pays exactly `0`.

## Constraints

- `1 <= coins.length <= 300`
- `1 <= coins[i] <= 5000`
- All values in `coins` are distinct.
- `0 <= amount <= 5000`
- The answer fits in a signed 32-bit integer.

## Aim for

`O(n · amount)` time and `O(amount)` space for `n` coins. It's unbounded-knapsack counting: one array `ways[0..amount]`, coins in the outer loop, amounts ascending in the inner loop. Expect to be asked why swapping the two loops counts something else.

## Follow-ups

- Count ordered sequences instead, so `3+5` and `5+3` are different. What changes?
- Each coin may be used at most once. Which direction does the inner loop run now?
- Return the fewest coins that make `amount` instead of the number of combinations.
