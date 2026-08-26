# Meeting Rooms II — in-app drill

**Day 21 · Daily Bread · Medium · interval sweep + heap**
Stands in for LeetCode 253 (premium) — by most counts the single most Google-tagged premium problem there is. Original statement written for this app — same task, own words and examples.

## The task

A podcast company rents identical recording studios by the half-open slot `[start, end)`. Given the day's bookings as `intervals[i] = [start_i, end_i]`, return the **minimum number of studios** that lets every booking happen as scheduled.

A studio frees up at the instant a session ends: a booking ending at `11` and another starting at `11` can share one studio.

## Examples

**Example 1**

```
intervals = [[9,12],[10,11],[11,13]]   -> 2
```

At `10` two sessions overlap, so two studios exist. The `[11,13)` session walks into the studio that `[10,11)` just left.

**Example 2**

```
intervals = [[1,4],[2,5],[3,6]]        -> 3
```

At time `3` all three are live at once. No cleverness survives that.

**Example 3**

```
intervals = [[7,8],[8,9]]              -> 1
```

Back-to-back is not overlap.

## Constraints

- `1 <= intervals.length <= 10^5`, `0 <= start < end <= 10^6`

## Aim for

`O(n log n)`. Two idiomatic shapes — know both and say which you're picking:

1. **Sweep with a min-heap of end times.** Sort by start; for each booking, if the earliest-ending studio is already free (`heap top <= start`), pop it; push your end time. Heap size high-water mark is the answer — actually the final heap size *is* the answer, and saying why is a nice moment.
2. **Two sorted arrays.** Sort starts and ends separately; walk with two pointers, `+1` on a start before the next end, `-1` otherwise; track the max.

The follow-up that makes this a *day-21* problem: yesterday's `extend or push` merged intervals, today's counts overlap depth — same sort, different bookkeeping. Name that connection out loud.

## Interviewer follow-ups to be ready for

- Return the peak *time*, not just the count. Which shape adapts faster?
- Bookings arrive online, one at a time — what do you keep, what's the per-booking cost?
- Each studio has a capacity and each booking a headcount: what does the heap become?

---
*Paste everything above into Claude and ask it to play interviewer — have it hold the solution back until you've talked through an approach and a complexity out loud.*
