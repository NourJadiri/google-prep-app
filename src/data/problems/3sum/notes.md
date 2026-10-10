## Approach

**Reduce to Two Sum on a sorted list.** Sort the numbers. For each index `i`, treat `nums[i]` as the smallest value of the triple — the anchor — and look for two values to its right that sum to `-nums[i]`.

On a sorted range that pair search is two pointers: `lo` just right of the anchor, `hi` at the end.

- Sum too small: move `lo` right. `nums[hi]` is already the biggest value available, so `nums[lo]` can't be part of any answer with the remaining values — discarding it loses nothing.
- Sum too big: move `hi` left, by the mirror argument.
- Zero: record the triple and move both pointers.

Each anchor costs one inward sweep, `O(n)`, so the whole search is `O(n^2)`.

**Duplicates, without a set.** Sorting puts equal values next to each other, so repeats are easy to skip:

- If `nums[i] == nums[i - 1]`, this anchor would find exactly the triples the previous one found — skip it. Compare with the *previous* value, not the next: the first copy of a value must be kept, since it's the only one that can pair with its twin to its right (`[-1,-1,2]`).
- After a hit, advance `lo` past copies of the value just used. `hi` needs no skipping of its own: with a strictly bigger `nums[lo]`, an unchanged `nums[hi]` makes the sum positive, and the loop moves `hi` itself.

Once `nums[i] > 0` every remaining value is positive, so the loop can stop early.

## Complexity

`O(n^2)` time: `O(n log n)` to sort, then one `O(n)` sweep per anchor. `O(n)` extra space for the sorted copy (`O(1)` if you sort in place), not counting the output.

## Pitfalls

- Skipping an anchor when it equals the *next* value: it throws away the first copy, and with it `[-1,-1,2]` and `[0,0,0]`.
- Deduplicating only the anchor: a run of equal middle values then records the same triple several times.
- A set of sorted tuples does remove duplicates, but it hides the reasoning an interviewer wants to hear and adds memory; say why sorting makes it unnecessary.
