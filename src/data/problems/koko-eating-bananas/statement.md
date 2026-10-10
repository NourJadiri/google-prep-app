# Koko Eating Bananas

## The task

Koko has `h` hours and a row of banana piles, with `piles[i]` bananas in pile `i`. Before starting she fixes an eating speed of `k` bananas per hour, where `k` is a positive integer. Each hour she works on a single pile: she eats `k` bananas from it, or everything left if fewer than `k` remain. Any time left over in that hour is wasted, because she never starts a second pile within the same hour.

Return the smallest speed `k` that lets her finish every pile within `h` hours.

## Examples

**Example 1**

```
piles = [5,9,2], h = 6   -> 3
```

At speed `3` the piles take `2 + 3 + 1 = 6` hours. At speed `2` they'd take `3 + 5 + 1 = 9`.

**Example 2**

```
piles = [4,4,4], h = 3   -> 4
```

With exactly one hour per pile, she must clear the biggest pile in a single hour.

**Example 3**

```
piles = [7,1], h = 100   -> 1
```

With plenty of time, the slowest possible speed works.

## Constraints

- `1 <= piles.length <= 10^4`
- `piles.length <= h <= 10^9`
- `1 <= piles[i] <= 10^9`

## Aim for

`O(n log m)`, where `m = max(piles)`. A pile of `p` bananas takes `ceil(p / k)` hours, and the total can only shrink as `k` grows, so the speeds that work are exactly those from some threshold upward. Binary search for that threshold in `[1, m]`, summing the hours in `O(n)` per probe. Trying speeds one at a time is `O(n m)`, and `m` can be `10^9`.

## Follow-ups

- Compute the ceiling with integers only, and explain why that matters.
- Can you narrow the search range before starting? (Hint: total bananas over `h`.)
- Same pattern, new story: ship packages in their given order within `d` days using the smallest possible ship capacity.
