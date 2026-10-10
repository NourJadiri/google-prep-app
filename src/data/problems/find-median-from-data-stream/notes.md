## Approach

Split the numbers into two halves and only ever look at the boundary between them.

- `low` holds the smaller half as a **max-heap**, so its top is the largest of the small numbers.
- `high` holds the larger half as a **min-heap**, so its top is the smallest of the large numbers.

Keep two invariants: every value in `low` is `<=` every value in `high`, and `low` has either as many elements as `high` or exactly one more. With those in place, the median sits at the tops. If `low` is bigger, the count is odd and its top is the middle element. Otherwise the median is the mean of the two tops.

**Adding a number without breaking either invariant.** Push `num` onto `low`, then move `low`'s largest value over to `high`. Whichever side `num` belonged on, the value that crosses is the largest of the old `low` plus `num`, so the ordering holds. That move made `high` one bigger, so if `high` now outnumbers `low`, move `high`'s smallest value back. Every add is the same three heap operations, with no case analysis.

Python's `heapq` only provides min-heaps, so `low` stores negated values: push `-num`, and read the top as `-low[0]`.

## Complexity

`addNum` is `O(log n)`: a constant number of heap pushes and pops. `findMedian` is `O(1)` because it only reads the tops. Space is `O(n)` for the numbers themselves.

For comparison, a sorted list maintained with `bisect.insort` finds each position in `O(log n)` but shifts up to `n` elements per insert, so `addNum` is `O(n)`. It's fast in practice because the shift is a single `memmove`, but it's still linear. Sorting a fresh copy on every `findMedian` costs `O(n log n)` per query and times out on the large tests, as does a hand-rolled binary search tree when the values arrive already sorted. (Re-sorting one list in place is gentler than it looks: timsort spots the already-sorted run, so each call costs about `O(n)`, much like the insert.)

## Pitfalls

- Floor division in the even case. `(a + b) // 2` turns `1.5` into `1` and `-1.5` into `-2`. Use `/`.
- Forgetting to negate on the way into or out of the max-heap. The "max-heap" silently becomes a second min-heap, and the halves stop being halves.
- Balancing the sizes without fixing the order. Pushing each new value onto whichever heap is smaller keeps the sizes right, but it can leave a large value stuck in `low`. Route every new value through one heap into the other.
