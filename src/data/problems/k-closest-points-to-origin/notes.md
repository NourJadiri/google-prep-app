## Approach

**A bounded max-heap.** Walk the points once, keeping the `k` closest seen so far in a heap whose root is the *farthest* of them. For each new point: while the heap holds fewer than `k` points, push it; after that, if the newcomer is closer than the root, replace the root with it, otherwise ignore it. When the walk ends, the heap holds the answer.

Why that's correct: the invariant is "the heap holds the `k` closest of the points seen so far". A newcomer either belongs in that set — and then it must push out the farthest member, which is exactly the root — or it doesn't, and nothing changes. One pass keeps the invariant all the way to the end.

Python's `heapq` is a min-heap, so the key goes in negated: `(-(x*x + y*y), x, y)`. The smallest key is then the largest distance, so the root is the farthest point kept, and "closer than the root" reads `-d > heap[0][0]`. `heapreplace` pops the root and pushes the newcomer in one `O(log k)` step.

**Squared distances.** `sqrt` never changes which of two distances is bigger, so comparing `x*x + y*y` gives the same order in exact integer arithmetic — no floats, no rounding, no wasted work.

**The alternatives, and when each wins.** Sorting by squared distance and slicing is `O(n log n)` and the simplest correct answer — say it first. Quickselect partitions around a pivot distance like quicksort but recurses only into the side that contains position `k`: `O(n)` on average, the fastest offline, but `O(n^2)` with unlucky pivots, it reorders the input, and it needs every point in memory at once. The heap is the one that works on a stream and never holds more than `k` points.

## Complexity

Heap: `O(n log k)` time — each point costs at most one push or replace on a heap of size `k` — and `O(k)` extra space. Sorting: `O(n log n)` time, `O(n)` space. Quickselect: `O(n)` average time, `O(n^2)` worst case.

## Pitfalls

- Treating `heapq` as a max-heap without negating. Pushing every point and popping whenever the heap grows past `k` then throws away the *closest* point each time and keeps the `k` farthest.
- Manhattan distance (`|x| + |y|`) instead of straight-line: `[0,6]` is fewer grid steps from the origin than `[4,4]`, but farther away.
- Taking `sqrt` and comparing floats: unnecessary, and a habit that bites when two distances are almost equal.
