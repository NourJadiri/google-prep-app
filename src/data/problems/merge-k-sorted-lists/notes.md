## Approach

At every step, the next node of the merged list is the smallest of the `k` current heads. The whole problem is finding that minimum quickly, over and over.

**Min-heap of heads.** Put the head of every non-empty list into a min-heap. Pop the smallest, append it to the result, and push its successor (if any) in its place. The heap always holds exactly one candidate from each unfinished list, so its top is always the smallest value left anywhere. Each node is pushed once and popped once.

In Python, push tuples `(val, i, node)`, where `i` is the index of the list the node came from. When two values tie, `heapq` compares the second fields. No two entries in the heap share an `i`, so the comparison is settled there and never reaches the `ListNode`s, which can't be ordered. Link the popped nodes together behind a dummy head, so no new nodes are needed.

**Divide and conquer.** Merge the lists in pairs (`0` with `1`, `2` with `3`, …), then merge those results in pairs, and so on until one list remains. That's the merge step of merge sort, applied to whole lists. In each round every node takes part in exactly one two-list merge, and there are `log k` rounds. No heap is needed.

**Why the obvious approaches are slow.** Merging list after list into one accumulator re-walks the growing accumulator every time. The `i`-th merge can cost `i · N / k`, so the total is `O(N k)`. Scanning all `k` heads to find each minimum is `O(N k)` too. With `k = 10^4`, that's hundreds of millions of steps, and the large tests are arranged so both approaches time out.

## Complexity

Heap: `O(N log k)` time for `N` pushes and pops on a heap of at most `k` entries, plus `O(k)` to `heapify` the first heads. `O(k)` extra space for the heap.

Divide and conquer: also `O(N log k)` time. Done in place in the `lists` array with an iterative two-list merge, it needs only `O(1)` extra space. A recursive two-list merge instead uses stack proportional to the lengths being merged.

Collecting every value, sorting, and building a fresh list is `O(N log N)`. That's fine in practice, but it allocates `N` new nodes and ignores the fact that each list is already sorted.

## Pitfalls

- Heap entries of `(val, node)`: the first tie makes `heapq` compare two `ListNode`s, which raises `TypeError`. Add a tie-breaker.
- Pushing empty lists (`None`) into the heap.
- In a two-list merge, forgetting to attach the remainder. When one list runs out, the rest of the other is already sorted and gets linked in whole.
