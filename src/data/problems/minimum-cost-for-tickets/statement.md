# Minimum Cost For Tickets

## The task

You've planned train trips for the coming year: `days` lists the calendar days you'll travel, strictly increasing, each between `1` and `365`. Three kinds of pass are on sale:

- a 1-day pass for `costs[0]`
- a 7-day pass for `costs[1]`
- a 30-day pass for `costs[2]`

A `k`-day pass bought for day `d` is valid on the `k` consecutive days `d, d + 1, …, d + k - 1`, so a 7-day pass bought for day 2 covers days 2 through 8. You can buy any number of passes for any days, and a pass may run past day 365. Return the minimum total cost such that every travel day is covered by at least one pass.

The prices are arbitrary: a longer pass isn't necessarily more expensive.

## Examples

**Example 1**

```
days = [3,5,6,9,10,11,25], costs = [3,10,28]   -> 16
```

A 7-day pass for day 5 covers days `5..11`, five of the trips, for 10. Days 3 and 25 get a 1-day pass each: `3 + 10 + 3 = 16`.

**Example 2**

```
days = [8], costs = [9,4,30]   -> 4
```

One trip, and the 7-day pass is the cheapest way to cover it.

**Example 3**

```
days = [2,6,9,13,16,20,24,27,31], costs = [4,12,30]   -> 30
```

One 30-day pass for day 2 covers days `2..31`: all nine trips.

## Constraints

- `1 <= days.length <= 365`
- `1 <= days[i] <= 365`
- `days` is strictly increasing.
- `costs.length == 3`
- `1 <= costs[i] <= 1000`

## Aim for

`O(D)` time and space with `D = days[-1] <= 365`, or `O(n)` over the trips alone. Let `best[d]` be the cheapest way to cover every trip up to calendar day `d`. On a day without a trip nothing changes. On a travel day, the pass covering it can be assumed to end that day, which leaves three candidates, one per pass.

## Follow-ups

- Only the last 30 values of `best` are ever read. Get the space down to `O(30)`.
- Index the DP by trip instead of by calendar day. Why would that matter if days ran up to `10^9`?
- Generalise to `k` pass types with arbitrary durations.
