## Approach

Look at the last travel day you need to cover. Some pass covers it. As far as trips up to that day are concerned, sliding that pass so it *ends* exactly on that day can only help: it still covers the day and now reaches as far back as possible. That observation turns the problem into a DP over calendar days.

**Subproblem.** `best[d]` = the cheapest way to cover every trip on or before calendar day `d`.

**Recurrence.** If `d` is not a travel day, `best[d] = best[d - 1]`, since nothing new needs covering. If it is, the pass covering `d` ends on `d` and is one of three kinds:

`best[d] = min(best[d - 1] + costs[0], best[d - 7] + costs[1], best[d - 30] + costs[2])`

Clamp a negative index to `0`: a pass reaching back before day 1 covers everything up to `d`.

**Base case.** `best[0] = 0`: no trips, no cost.

**Fill order.** `d` from 1 up to the last travel day. Each entry looks back at most 30 days, and the answer is `best[days[-1]]`.

**Why not greedy.** The prices are arbitrary and the choices interact across weeks: whether a 7-day pass pays off depends on how the trips around it get covered. Example 2 alone breaks "use day passes unless the week is busy", because there the 7-day pass beats the day pass for a single trip.

**Top-down.** `cover(i)` = the cheapest way to cover `days[i:]`. Try each pass bought on `days[i]`, skip every trip it covers (with a pointer or `bisect`), and recurse, memoised on `i`. That's the trip-indexed version: `n` states with three transitions each, at most `n` calls deep, and it doesn't care how large the day numbers get.

**Space.** `best[d]` only reads the last 30 entries, so a ring buffer of 30 values is enough.

## Complexity

`O(D)` time and space for `D = days[-1] <= 365`, or `O(30)` space with the ring buffer. The trip-indexed version is `O(n)` with three forward-only pointers (one per pass) and `O(n log n)` with `bisect`.

## Pitfalls

- Coverage off by one: a 7-day pass bought on day `d` covers `d..d + 6`. Counting `d + 7` as covered lets trips exactly a week apart share one pass.
- Assuming longer passes cost more. They don't have to (Example 2).
- Forgetting to clamp: write `best[max(0, d - 30)]`. A negative index in Python quietly reads from the end of the list.
