## Approach

**Simulate — with the right container.** The rules spell out exactly what happens, so the only real question is how to carry them out efficiently. Each round needs the two heaviest stones, and may put one new stone back. Re-sorting a list after every round works, but each sort costs `O(n log n)`.

A **heap** is built for exactly this pattern: it hands you the smallest item and accepts new items in `O(log n)` each, without ever keeping the whole collection sorted. Python's `heapq` module works on a plain list:

- `heapq.heapify(items)` rearranges a list into a heap, in `O(n)`.
- `heapq.heappop(heap)` removes and returns the smallest item.
- `heapq.heappush(heap, x)` adds an item.

`heapq` is a **min-heap**, but this problem wants the heaviest stone. The standard trick: store every weight negated. The heaviest stone becomes the most negative number — the smallest — so it comes out first. Negate again whenever you read a weight back.

The loop: while at least two stones remain, pop the heaviest, `y`, then the next heaviest, `x`. If they differ, push `y - x` back (negated, like everything else). When the loop stops, the heap holds one stone or none, and the answer is that stone's weight or `0`.

Why isn't one sort at the start enough? Because the leftover `y - x` can be lighter than stones still waiting in the pile. It doesn't belong on top; it has to be slotted into its proper place — and the heap does that slotting in `O(log n)`. In Example 1, the leftover `2` from smashing `9` and `7` is lighter than the `3` still in the pile.

How to spot a heap problem: you repeatedly take the largest (or smallest) item, do something with it, and maybe put something new back. In Python, reach for `heapq`, and negate the values when you need the largest.

## Complexity

`O(n log n)` time: every round removes at least one stone, so there are at most `n - 1` rounds, each a few `O(log n)` heap operations (plus `O(n)` to heapify at the start). `O(n)` extra space for the heap.

## Pitfalls

- Forgetting that `heapq` is a min-heap. Popping without negating smashes the two lightest stones instead.
- Returning `heap[0]` instead of `-heap[0]`, which reports the weight as a negative number.
- Assuming the leftover piece is still the heaviest stone (the sort-once bug above).
- Indexing into an empty heap when the last two stones cancel out. Return `0` instead.
