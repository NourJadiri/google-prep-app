# Design Hit Counter — in-app drill

**Day 23 · Design District · Medium · design / circular buffer**
Stands in for LeetCode 362 (premium). Original statement written for this app — same task, own words and examples.

## The task

Design the rate meter for an API gateway. Timestamps are in seconds and arrive in non-decreasing order; several calls may share a timestamp. Implement:

- `record(t)` — an event happened at second `t`
- `count(t)` — how many events happened in the last 300 seconds, i.e. in the window `[t - 299, t]`

## Example

```
record(5); record(140); record(298);
count(298)  -> 3      // all three inside [-1, 298]
record(305);
count(305)  -> 3      // [6, 305]: the event at 5 has aged out
count(600)  -> 1      // [301, 600]: only 305 survives
```

## Constraints

- `1 <= t <= 10^9`, up to `10^5` operations, timestamps never decrease.

## Aim for

The naive deque of timestamps is correct and `O(1)` amortised — say it first, then beat its memory: under heavy traffic it stores every event. The interview answer is **two fixed arrays of size 300** — `time[i]` and `hits[i]` indexed by `t % 300`. On `record`, if `time[t % 300] != t`, the bucket is stale from a previous lap: overwrite it and reset its count; otherwise increment. On `count`, sum the buckets whose stamp is inside the window. That's `O(1)` memory forever, `O(300)` per count — constants, and you should say so in exactly those words.

## Interviewer follow-ups to be ready for

- Timestamps stop being monotonic — what breaks in each design?
- Make `count` O(1) too. (Maintain a running total as buckets expire — what's the catch?)
- Scale it out: hits land on 50 machines and someone calls `count` — sketch the aggregation and its staleness trade-off.
- Change 300 seconds to 24 hours at millisecond resolution — which design survives the retune?

---
*Paste everything above into Claude and ask it to play interviewer — have it hold the solution back until you've talked through an approach and a complexity out loud.*
