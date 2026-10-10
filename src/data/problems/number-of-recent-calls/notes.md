## Approach

**The pattern: a queue as a sliding window.** A queue is first in, first out, like the line at a ticket counter: people join at the back and leave from the front. Python's `collections.deque` is a queue where `append` (join at the back) and `popleft` (leave from the front) are both `O(1)`. A plain list's `pop(0)` has to shift every remaining item along, so it's `O(n)`.

Here the queue holds the times of the requests that still count as recent, oldest at the front. On each `ping(t)`:

1. Append `t` to the back.
2. While the time at the front is older than `t - 3000`, pop it off the front.
3. What's left is exactly the requests in `[t - 3000, t]`, so return the length of the queue.

Why is it safe to throw requests away forever? Because times only increase. If a request is older than `t - 3000` now, then for any later ping `t2 > t` it's older than `t2 - 3000` as well, so it can never count again. And because the queue is in time order, all the requests that are too old sit together at the front. You can stop popping at the first one that's still inside the window.

Here's a trace of Example 1:

- `ping(10)`: the queue is `[10]`, so the answer is 1.
- `ping(2000)`: `[10, 2000]`, so 2.
- `ping(3010)`: the cutoff is `3010 - 3000 = 10`. Is `10 < 10`? No, it's exactly on the edge, so it stays. `[10, 2000, 3010]`, so 3.
- `ping(3011)`: the cutoff is `11`, and `10 < 11`, so `10` is popped. `[2000, 3010, 3011]`, so 3.
- `ping(6500)`: everything below `3500` is popped. `[6500]`, so 1.

**Spotting it next time.** "How many events happened in the last X?", with time that only moves forward, is a sliding window over a queue. New events come in at one end and expired ones leave at the other. The same shape turns up in rate limiters, hit counters and moving averages.

## Complexity

Each request is appended once and popped at most once, so `n` pings cost `O(n)` in total, which is amortised `O(1)` per `ping`. Space is `O(w)`, where `w` is the largest number of requests that ever fall inside one 3000 ms window. At worst that's every ping.

## Pitfalls

- The window includes both ends. A request made exactly 3000 ms ago still counts, so pop only while the front is `< t - 3000`, not `<= t - 3000`.
- Using a list with `pop(0)`. The answers are right, but every `pop(0)` shifts all the remaining items. A `deque` pops from the front in `O(1)`.
- Recounting the whole history on every ping. That's correct but `O(n)` per call. 10,000 pings means about 50 million checks, and the large test may well time out.
