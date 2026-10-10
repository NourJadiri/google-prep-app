# Number of Recent Calls

## The task

A server wants to know how busy it has been lately. Implement `class RecentCounter`:

- `RecentCounter()` starts with no requests recorded.
- `ping(t)` records a new request made at time `t`, in milliseconds. It returns how many requests were made in the last 3000 milliseconds, including this one: every request whose time is in the window `[t - 3000, t]`, with both ends included.

Each call to `ping` uses a strictly larger `t` than the call before it.

The tests drive the class LeetCode-style: a list of operation names and a matching list of argument lists, with the constructor first. The expected output has one entry per operation, with `null` for the constructor.

## Examples

**Example 1**

```
ops  = ["RecentCounter","ping","ping","ping","ping","ping"]
args = [[],[10],[2000],[3010],[3011],[6500]]
                                             -> [null,1,2,3,3,1]
```

At `3010` the window is `[10, 3010]`. The request at `10` sits exactly on the left edge, so it still counts, and the answer is 3. At `3011` the window is `[11, 3011]`. The request at `10` drops out as `3011` comes in, so the count stays at 3. At `6500`, only the new request is inside `[3500, 6500]`.

**Example 2**

```
ops  = ["RecentCounter","ping","ping","ping","ping","ping"]
args = [[],[100],[200],[300],[9000],[9001]]
                                             -> [null,1,2,3,1,2]
```

After a long quiet spell, all the older requests have left the window at once.

## Constraints

- `1 <= t <= 10^9`
- Every call to `ping` has a strictly larger `t` than the call before.
- At most `10^4` calls to `ping`.

## Aim for

Counting through every request you've ever seen costs `O(n)` per ping, and that adds up. Notice that times only increase, so a request that's too old for one ping is too old for every later ping as well. That means you can throw old requests away for good. Which structure lets you add items at one end and remove them from the other, both in `O(1)`? Each request then goes in once and comes out at most once, so `ping` is amortised `O(1)`.

## Follow-ups

- Requests can now arrive a little out of order. What breaks, and how would you fix it?
- Make the window length a constructor parameter. Does anything else need to change?
- Millions of requests arrive every second, and storing every timestamp takes too much memory. How could you give up a little accuracy to save space? (Think about grouping time into buckets.)
