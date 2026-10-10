# Design Hit Counter

Stands in for LeetCode 362 (premium). Original statement written for this app — same task, own words and examples.

## The task

Design the rate meter for an API gateway. Timestamps are in seconds and arrive in non-decreasing order; several calls may share a timestamp. Implement `class HitCounter`:

- `HitCounter()` — starts with no events
- `record(t)` — an event happened at second `t`
- `count(t)` — how many events happened in the last 300 seconds, i.e. in the window `[t - 299, t]`

The tests drive the class LeetCode-style: a list of operation names and a matching list of argument lists, with the constructor first. The expected output holds one entry per operation — `null` for the constructor and for `record`.

## Examples

**Example 1**

```
ops  = ["HitCounter","record","record","record","count","record","count","count"]
args = [[],[5],[140],[298],[298],[305],[305],[600]]
                                                    -> [null,null,null,null,3,null,3,1]
```

`count(298)` sees all three events (window `[-1, 298]`). After `record(305)`, `count(305)` looks at `[6, 305]`: the event at `5` has aged out. `count(600)` looks at `[301, 600]`: only `305` survives.

**Example 2**

```
ops  = ["HitCounter","record","record","record","count","count"]
args = [[],[1],[1],[1],[1],[300]]
                                                    -> [null,null,null,null,3,3]
```

Three hits in the same second all count, and second `1` is still inside `[1, 300]`.

## Constraints

- `1 <= t <= 10^9`, up to `10^5` operations, timestamps never decrease.

## Aim for

The naive deque of timestamps is correct and `O(1)` amortised — say it first, then beat its memory: under heavy traffic it stores every event. The interview answer is **two fixed arrays of size 300** — `time[i]` and `hits[i]` indexed by `t % 300`. On `record`, if `time[t % 300] != t`, the bucket is stale from a previous lap: overwrite it and reset its count; otherwise increment. On `count`, sum the buckets whose stamp is inside the window. That's `O(1)` memory forever, `O(300)` per count — constants, and you should say so in exactly those words.

## Follow-ups

- Timestamps stop being monotonic — what breaks in each design?
- Make `count` O(1) too. (Maintain a running total as buckets expire — what's the catch?)
- Scale it out: hits land on 50 machines and someone calls `count` — sketch the aggregation and its staleness trade-off.
- Change 300 seconds to 24 hours at millisecond resolution — which design survives the retune?
