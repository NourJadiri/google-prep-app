## Approach

**The pattern: binary search.** Think about looking up a word in a paper dictionary. You don't start reading at page one. You open it somewhere near the middle, see whether your word comes before or after that page, and ignore the half it can't be in. Each look halves what's left, so even a 1,000-page dictionary takes only about 10 looks.

In code, keep two indices, `lo` and `hi`, that come with a promise, called the **invariant**: *if `target` is in the list at all, it's somewhere in `nums[lo..hi]`, both ends included.* Start with the whole list, `lo = 0` and `hi = len(nums) - 1`. Then, while the range isn't empty (`lo <= hi`), repeat:

1. Look at the middle element: `mid = (lo + hi) // 2`.
2. If `nums[mid] == target`, you've found it, so return `mid`.
3. If `nums[mid] < target`, then because the list is sorted, `mid` and everything to its left are too small. The target can only be to the right, so set `lo = mid + 1`.
4. Otherwise `nums[mid] > target`, so `mid` and everything to its right are too big. Set `hi = mid - 1`.

Every step keeps the promise and removes at least `mid` itself, so the range always gets smaller. If it ends up empty (`lo > hi`), the promise tells you the target was never there, so return `-1`.

Here's a trace of Example 1, `[-8,-3,0,4,11,15,23]` with target `11`:

- `lo = 0`, `hi = 6`, `mid = 3`. `4 < 11`, so `lo = 4`.
- `lo = 4`, `hi = 6`, `mid = 5`. `15 > 11`, so `hi = 4`.
- `lo = 4`, `hi = 4`, `mid = 4`. Found it: return `4`.

**Why `lo <= hi`, and why the `+ 1` and `- 1`?** Both follow from the promise. "Both ends included" means a range where `lo == hi` still holds one element that hasn't been checked, so the loop has to run when `lo == hi`. And since `mid` has just been checked, it's safe to leave it out with `mid + 1` or `mid - 1`. In fact you must, because otherwise the range can stop shrinking and the loop never ends.

**Spotting it next time.** Binary search works whenever you can ask a yes/no question at any position and the answers are *monotonic*, meaning all the answers of one kind come before all the answers of the other. A sorted list is the most obvious example, but not the only one. The next problems in this track (Search Insert Position, First Bad Version and Sqrt(x)) use this same loop to answer different questions. When you hear "sorted", "find" and "faster than `O(n)`" together, think binary search.

## Complexity

`O(log n)` time: the range halves at every step, so 10,000 elements take at most 14 steps. `O(1)` extra space.

In languages with fixed-size integers, `(lo + hi) // 2` can overflow for huge arrays, and writing `lo + (hi - lo) // 2` avoids that. Python's integers never overflow, but it's worth mentioning in an interview.

## Pitfalls

- Writing `while lo < hi` when `hi` is included in the range. Once the range shrinks to a single element, the loop stops without checking it, so `[42]` with target `42` returns `-1`.
- Writing `lo = mid` or `hi = mid` in this version. The range can stop shrinking, and the loop never ends.
- Starting with `hi = len(nums)` but treating `hi` as included. `mid` can then point one past the end of the list.
