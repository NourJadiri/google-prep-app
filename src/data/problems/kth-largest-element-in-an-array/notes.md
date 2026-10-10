## Approach

In ascending order, the `k`-th largest value sits at index `n - k`. Quickselect finds the value that belongs at that index without sorting anything else. It's quicksort that only recurses into one side.

Pick a pivot at random and partition the current range `[lo, hi]` into three blocks: values less than the pivot, values equal to it, and values greater than it. After the partition, each block holds exactly the values that belong in those positions of the sorted array, and the equal block is already in its final place. So:

- if `n - k` falls inside the equal block, the pivot is the answer;
- if it falls to the left, keep only the left block; if to the right, only the right block.

The three-way partition (Dijkstra's *Dutch national flag*) keeps three markers: `lt` (end of the "less" block), `i` (next unexamined value) and `gt` (start of the "greater" block, growing from the right). A smaller value is swapped down to `lt`. A larger value is swapped up to `gt`, and `i` stays put because the value that just arrived from `gt` hasn't been examined yet. An equal value is skipped.

The random pivot and the three blocks are both necessary. A fixed pivot (the first or last element) on sorted input peels off one element per round, which is `O(n^2)`. With a two-way partition, an array of 100,000 copies of one value puts everything on the same side every round, which is also `O(n^2)`. The large tests include both.

The heap alternative is worth having ready: keep a min-heap of the `k` largest values seen so far, replacing the top whenever a bigger value arrives. At the end the top of the heap is the `k`-th largest. It's `O(n log k)` with `O(k)` space, it's never quadratic, and it works on a stream.

## Complexity

Quickselect takes expected `O(n)` time. A random pivot discards a constant fraction of the range on average, so the work is roughly `n + n/2 + n/4 + …`. Precisely, it averages at most about `3.4n` comparisons. The worst case is `O(n^2)`, but it needs unlucky pivots round after round, which randomness makes vanishingly unlikely. Extra space is `O(1)` because the partition is in place. That reorders `nums`, so mention it, or copy the list first.

Heap: `O(n log k)` time, `O(k)` space.

## Pitfalls

- Aiming at index `k - 1` of the ascending order instead of `n - k`. That finds the `k`-th *smallest* value.
- Deduplicating first. `sorted(set(nums))` answers a different question: the `k`-th largest *distinct* value.
- Partitioning two ways, or always pivoting on the first or last element. The answer is still correct, but it goes quadratic on duplicates or sorted input, and the tests include 100,000-element arrays of each.
