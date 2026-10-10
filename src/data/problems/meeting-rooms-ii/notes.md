## Approach

The answer is the overlap depth: the largest number of bookings live at the same instant. Fewer studios than that can't work — those bookings all need a studio at that moment — and a greedy assignment never needs more.

**Heap sweep.** Process bookings in order of start time, and keep a min-heap holding, for every studio opened so far, the end time of its latest session. For each booking, look at the studio that frees up first (`ends[0]`). If it's free by this booking's start (`ends[0] <= start` — half-open slots, so ending at `11` and starting at `11` is fine), give the booking that studio: replace its end time with this booking's end. Otherwise every studio is busy right now, so open a new one by pushing the end time.

Why it's optimal: a new studio is opened only when the earliest-ending session hasn't finished — so at that `start`, every studio holds a session that began at or before it (they were processed earlier) and ends after it. All of them, plus the new booking, are live at once; the number of studios never exceeds the overlap depth. And because the heap only ever grows or stays the same size, its final size is the peak.

**Two sorted arrays.** Sort the starts and the ends separately and merge them like a sweep line: a start that comes before the next unconsumed end means one more live booking; otherwise consume the end first. On a tie, consume the end first (it frees the studio). The running maximum is the answer. Same `O(n log n)`, no heap, and it makes the "overlap depth" view explicit.

## Complexity

`O(n log n)` time: the sort, then `n` heap operations of `O(log n)` each. `O(n)` space for the sorted copy and the heap. The two-array version has the same bounds.

## Pitfalls

- `ends[0] < start` instead of `<=`: back-to-back bookings would each take a fresh studio.
- Skipping the sort, or sorting by end time: the greedy reuse argument needs bookings in start order.
- Popping *every* free studio and then pushing gives the same answer only if you track the maximum heap size — the final size after pops is not the peak.
- Comparing each booking with every other is `O(n^2)` — `10^10` pairs at the limits.
