## Approach

**The pattern: a read pointer and a write pointer.** A lot of in-place list problems come down to the same move. One index, `read`, walks over every element. A second index, `write`, trails behind it and marks the slot where the next element worth keeping should go. The reader decides what to keep, and the writer packs the keepers tightly at the front. Because `write` never gets ahead of `read`, you only ever write over slots you've already looked at.

Here the keepers are the non-zero values. Each time `read` finds one, swap it into `nums[write]` and move `write` up by one. Zeros are simply walked past; the swaps push them backwards as the non-zero values move forward.

Tracing `[0,5,0,0,2,9]`:

```
read 0: 0, skip                [0,5,0,0,2,9]   write 0
read 1: 5, swap into slot 0    [5,0,0,0,2,9]   write 1
read 2: 0, skip
read 3: 0, skip
read 4: 2, swap into slot 1    [5,2,0,0,0,9]   write 2
read 5: 9, swap into slot 2    [5,2,9,0,0,0]   write 3
```

**Why it works.** Before each step, `nums[:write]` holds exactly the non-zero values seen so far, in the order they were met, and `nums[write:read]` holds only zeros. A swap keeps both facts true: the new non-zero value joins the end of the front block, and the zero that was sitting at `nums[write]` (if no zero has turned up yet, the value just swaps with itself) moves to the end of the zero block. When `read` reaches the end of the list, the zero block runs all the way to the back.

An equally good version copies each non-zero value forward (`nums[write] = nums[read]`), then fills `nums[write:]` with zeros in a second loop. It's the same `O(n)`, with one extra loop to remember.

**Spotting it next time.** "In place", "keep the relative order", "remove", "compact", "move to the end": when a problem asks you to filter a list without using a second list, reach for a reader and a writer. The same skeleton solves Remove Duplicates from Sorted Array, Remove Element, and the partition step of quicksort.

## Complexity

`O(n)` time: `read` visits each element once, and each visit does at most one swap. `O(1)` extra space: just two indices.

## Pitfalls

- Removing from the list while looping over it by index (`nums.pop(i)`, then `nums.append(0)`). The element after the removed zero slides into position `i` and is never examined, so back-to-back zeros get left behind. Each `pop(i)` is also `O(n)`, which makes the whole thing `O(n^2)`.
- In the copy-forward version, forgetting the second loop that writes zeros into the tail.
- `nums = [x for x in nums if x != 0] + ...` only rebinds the local name, so the caller's list never changes. (`nums[:] = ...` does write into the list, but it builds a second list to do it, which isn't `O(1)` space.)
