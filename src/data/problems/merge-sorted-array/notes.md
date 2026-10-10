## Approach

**The pattern: merging two sorted lists with two pointers.** This is the merge step of merge sort. Keep one pointer in each list, compare the two values they point at, take whichever should come next, and advance only that pointer. Every comparison places one value for good, so the whole merge is a single pass.

The usual merge runs front to back into a fresh list. Here the result has to land in `nums1`, and front to back would trample `nums1`'s own values before they're placed: putting `1` first in Example 1 means overwriting the `2`. The free space is at the *back* of `nums1`, so merge from the back, taking the largest remaining value each time:

- `i` points at the last real value of `nums1` (index `m - 1`), `j` at the last value of `nums2` (index `n - 1`), and `write` at the last slot (index `m + n - 1`).
- Whichever of `nums1[i]` and `nums2[j]` is bigger goes into `nums1[write]`. Move that pointer and `write` one step left.
- Stop when `nums2` runs out. If `nums1` runs out first, keep copying from `nums2`.

Tracing Example 1, `nums1 = [2,5,8,0,0]` and `nums2 = [1,6]`:

```
8 vs 6: take 8               [2,5,8,0,8]
5 vs 6: take 6               [2,5,8,6,8]
5 vs 1: take 5               [2,5,5,6,8]
2 vs 1: take 2               [2,2,5,6,8]
nums1 is used up: take 1     [1,2,5,6,8]
```

**Why it never overwrites anything it still needs.** Each step fills one slot and uses up one value, so `write == i + j + 1` the whole time. While `nums2` still has values (`j >= 0`), that means `write > i`: the slot being filled is always to the right of every `nums1` value not yet placed. When `nums2` runs out, `write == i`, and the `nums1` values that remain are already sorted and already sitting in their final slots. There's nothing left to do.

**Spotting it next time.** Two sorted inputs that must become one sorted output: merge with two pointers. If the output has to share space with an input and the spare room is at the end, fill from the end. The same backwards fill solves Squares of a Sorted Array, and the front-to-back merge is Merge Two Sorted Lists.

## Complexity

`O(m + n)` time: every value is placed exactly once. `O(1)` extra space: three indices.

## Pitfalls

- Stopping when *either* list runs out. Leftover `nums1` values are already in place, but leftover `nums2` values (the smallest of all) still have to be copied in, as in the last line of the trace, and in Example 2, where `m = 0`.
- Treating the placeholder zeros as data, for instance by sorting all of `nums1` together with `nums2`. Real zeros can appear too (Example 2), so only `m` tells you which slots are real.
- Rebinding with `nums1 = sorted(...)`: the caller's list never changes. `nums1[:] = sorted(nums1[:m] + nums2)` does work, in `O((m + n) log(m + n))` time with extra space. It's a fine first answer to mention before the in-place merge.
