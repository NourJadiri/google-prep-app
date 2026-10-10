## Approach

The list is already sorted and disjoint, so the new interval touches one contiguous run of it: everything before that run ends too early to reach it, everything after starts too late. One left-to-right pass handles the three regions in order:

1. **Before.** While `intervals[i]` ends before `start` (`end_i < start`), it can't touch the new interval: copy it.
2. **Overlapping.** While `intervals[i]` starts no later than `end` (`start_i <= end`), it overlaps — a shared endpoint counts. Absorb it: `start = min(start, start_i)`, `end = max(end, end_i)`.
3. **After.** Append the merged `[start, end]`, then copy every remaining interval unchanged.

Why that's right: phase 1 stops at the first interval that ends at or after `start`, and phase 2 absorbs intervals for as long as they start at or before `end` — each one genuinely shares a point with the new interval. Phase 2 stops at the first interval starting after `end`; everything from there on starts later still, so none of it is touched. The output stays sorted: every phase emits intervals in their original order, and the merged interval falls between the last "before" interval (which ends before it starts) and the first "after" one (which starts after it ends).

This is Merge Intervals with the sort already done for you: the only interval out of place is the new one, so a single pass that knows where it belongs replaces the `O(n log n)` sort.

## Complexity

`O(n)` time: each interval is examined once. `O(n)` space for the output, `O(1)` beyond it. Binary search can locate phase 2 in `O(log n)`, but building the output list still costs `O(n)` — it only pays off in a structure that supports cheap splicing.

## Pitfalls

- Off-by-one on touching: an interval that ends exactly at `start`, or starts exactly at `end`, overlaps. Skip with `end_i < start`, absorb with `start_i <= end`.
- Forgetting the smaller start: in `[[1,3]]` plus `[2,5]` the merged interval begins at `1`, not `2`.
- Losing the new interval when it belongs at the very end, or when `intervals` is empty — a loop that only emits it "before the next interval" never emits it at all.
