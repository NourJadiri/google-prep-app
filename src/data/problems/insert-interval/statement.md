# Insert Interval

## The task

`intervals` is a list of `[start, end]` pairs (`start <= end`, both ends included), sorted by `start`, no two of which overlap. Insert `newInterval`, merging it with every interval it overlaps, and return the resulting list — still sorted by `start`, still free of overlaps.

Two intervals overlap when they share at least one point: `[1,2]` and `[2,5]` overlap at `2`, while `[1,2]` and `[3,5]` don't. If the new interval overlaps several existing ones, all of them merge with it into one interval. You may return a new list rather than modify `intervals`.

## Examples

**Example 1**

```
intervals = [[1,2],[4,6],[9,11]], newInterval = [5,8]   -> [[1,2],[4,8],[9,11]]
```

`[5,8]` overlaps `[4,6]`; together they cover `[4,8]`.

**Example 2**

```
intervals = [[1,3],[5,6],[8,9],[11,14]], newInterval = [2,10]   -> [[1,10],[11,14]]
```

`[2,10]` reaches back into `[1,3]` and covers `[5,6]` and `[8,9]`: four intervals become `[1,10]`. `[11,14]` starts after `10` and survives untouched.

**Example 3**

```
intervals = [], newInterval = [4,7]   -> [[4,7]]
```

Nothing to merge with.

## Constraints

- `0 <= intervals.length <= 10^4`
- `intervals[i].length == 2` and `newInterval.length == 2`
- `0 <= start <= end <= 10^5` for every interval, `newInterval` included
- `intervals` is sorted by `start`, and no two of its intervals overlap.

## Aim for

`O(n)` time, one pass in three phases: copy the intervals that end before `newInterval` starts; fold in every interval that starts no later than it ends, widening it to the smaller start and the larger end; append it and copy the rest. Appending and re-running Merge Intervals also works at `O(n log n)` — say why the sorted input makes that sort unnecessary.

## Follow-ups

- Find the start and end of the overlapping run with binary search. What does that save, and what can't it save?
- Thousands of insertions arrive one after another. What structure keeps each one cheaper than `O(n)`?
- Remove an interval instead of inserting one. Which existing intervals get cut in two?
