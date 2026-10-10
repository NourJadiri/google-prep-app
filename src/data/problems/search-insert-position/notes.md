## Approach

**The same loop as Binary Search, plus one new idea.** Run exactly the loop from Binary Search. Set `lo = 0` and `hi = len(nums) - 1`, and while `lo <= hi`, compare `nums[mid]` with `target` and move `lo` up past `mid` or `hi` down past it. If you find the target, return `mid`. The only new question is this: *when the loop ends without finding it, where would the target go?*

The answer is `lo`. To see why, look at what the two pointers promise while the loop runs:

- Everything **to the left of `lo`** is smaller than `target`, because `lo` only ever moves past values that were too small.
- Everything **to the right of `hi`** is bigger than `target`, because `hi` only ever moves past values that were too big.

The loop stops when the range is empty, which happens when `lo == hi + 1`. The two pointers have crossed and now sit side by side. Every index is now either left of `lo`, holding something smaller, or right of `hi`, which means at `lo` or beyond, holding something bigger. So `lo` is the first position holding something bigger than `target`, which is exactly where `target` belongs.

Check the edge cases. A target smaller than everything never moves `lo`, so the answer is `0`. A target bigger than everything pushes `lo` all the way to `len(nums)`, one past the last index, which is the right answer for "insert at the end". You don't need any special cases.

Here's a trace of Example 2, `[10,20,30,40,50]` with target `35`:

- `lo = 0`, `hi = 4`, `mid = 2`. `30 < 35`, so `lo = 3`.
- `lo = 3`, `hi = 4`, `mid = 3`. `40 > 35`, so `hi = 2`.
- Now `lo = 3` is bigger than `hi = 2`, so stop and return `3`.

**The bigger picture: searching for a boundary.** Imagine asking a yes/no question at every index: "is `nums[i] >= target`?" Because the list is sorted, the answers look like `no, no, no, yes, yes`. This problem asks for the position of the first *yes*, or the length of the list if there's no yes at all. A lot of binary search problems are secretly this: find the boundary between the no's and the yes's. Python's `bisect.bisect_left(nums, target)` computes exactly this answer. It's handy in real code, but in an interview, write the loop yourself.

**Spotting it next time.** "Where would it go?", "the first element that's at least X", "how many are smaller than X" and "insertion point" are all the same boundary search. Once you spot the yes/no pattern, the loop above with `return lo` handles it.

## Complexity

`O(log n)` time, because the range halves at every step. `O(1)` extra space.

## Pitfalls

- Never being able to answer `len(nums)`. If your search only ever considers indices `0` to `len(nums) - 1` (say, `while lo < hi` with `hi = len(nums) - 1`), a target bigger than everything gets the last index instead of one past it.
- Returning `hi` or `mid` at the end. After the loop, `hi` is one *less* than the insertion point, and `mid` is just wherever the last comparison happened to be.
- Returning `-1` out of habit when the target isn't found. This problem always has an answer.
