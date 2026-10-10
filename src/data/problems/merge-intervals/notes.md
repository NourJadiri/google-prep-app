## Approach

**Sort by start, then sweep.** Once the intervals are sorted by start, the interval in hand can only overlap the *last* merged block. Every earlier block ended before the last one began (otherwise they would already have been merged), and the current interval starts no earlier than the last block did, so it can't reach back past it.

One pass then decides each interval with a single comparison:

- `start <= last_end`: it overlaps or touches the last block, so extend the block — `last_end = max(last_end, end)`;
- otherwise there's a gap: start a new block.

The `max` is essential. An interval can sit entirely inside the block (`[1,10]` followed by `[2,3]`), and assigning its end would shrink the block.

Why it's correct: after the first `i` sorted intervals, `merged` is exactly the merge of those `i` intervals — blocks in increasing order with gaps between them. The next interval starts at or after every earlier start, so it either connects to the last block or lies strictly beyond it; both cases keep the invariant. After the last interval, `merged` is the answer.

This sort-then-sweep shape is the backbone of most interval questions: Insert Interval, Meeting Rooms, Non-overlapping Intervals.

## Complexity

`O(n log n)` time for the sort; the sweep itself is `O(n)`. `O(n)` space for the sorted copy and the output.

## Pitfalls

- Assigning the end instead of taking the max: a nested interval shrinks the block it sits in.
- Treating touching intervals as separate (`start < last_end`): `[1,4]` and `[4,6]` share the point `4`.
- Skipping the sort, or sorting by end: in end order `[[3,5],[1,10]]` meets `[3,5]` first, and the block comes out as `[3,10]`, losing the earlier start.
