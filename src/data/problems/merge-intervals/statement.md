# Merge Intervals

## The task

Each entry of `intervals` is a pair `[start, end]` with `start <= end`, standing for every point from `start` to `end`, both ends included. Merge every group of overlapping intervals into one, and return the resulting non-overlapping intervals — together they must cover exactly the same points as the input.

Two intervals overlap when they share at least one point: `[1,4]` and `[4,6]` merge into `[1,6]`, while `[1,2]` and `[3,4]` stay apart, since the points between `2` and `3` belong to neither. Merging chains: if `A` overlaps `B` and `B` overlaps `C`, all three become one interval.

The input comes in no particular order, and the result may be returned in any order.

## Examples

**Example 1**

```
intervals = [[4,7],[1,3],[6,9],[12,14]]   -> [[1,3],[4,9],[12,14]]
```

`[4,7]` and `[6,9]` share `6` through `7` and become `[4,9]`. `[1,3]` ends before `4` begins, so it stays on its own.

**Example 2**

```
intervals = [[1,10],[3,4],[10,12]]   -> [[1,12]]
```

`[3,4]` lies inside `[1,10]`, and `[10,12]` touches it at `10` — touching counts.

**Example 3**

```
intervals = [[6,6],[1,2],[3,5]]   -> [[1,2],[3,5],[6,6]]
```

Nothing overlaps. `[6,6]` is a single point, and a perfectly good interval.

## Constraints

- `1 <= intervals.length <= 10^4`
- `intervals[i].length == 2`
- `0 <= start <= end <= 10^4`

## Aim for

`O(n log n)`: sort by start, then sweep once. Each interval either overlaps the last merged block — extend that block's end to the larger of the two ends — or begins a new block. Merging overlapping pairs over and over until nothing changes is cubic in the worst case and runs out of time on the large test.

## Follow-ups

- Intervals arrive one at a time and the merged set must stay current after each arrival. What structure makes each insertion cheap?
- Several people's busy intervals are given; return the free time they all share.
- The intervals don't fit in memory. How would you merge them in sorted chunks?
