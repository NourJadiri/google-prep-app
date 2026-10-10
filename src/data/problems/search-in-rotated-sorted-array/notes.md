## Approach

Plain binary search needs the whole range in order; a rotated list isn't. The rescue is a fact about the rotation: it leaves **at most one drop** (a spot where a number is bigger than the next). Cut any range `[lo, hi]` at `mid` and the drop can be in only one of the two halves — so at least one half is in perfect order.

Each step therefore does three things:

1. If `nums[mid] == target`, done.
2. Find the ordered half. If `nums[lo] <= nums[mid]`, the drop isn't in `[lo, mid]`, so that half is ordered; otherwise `[mid, hi]` is.
3. Ask the ordered half whether `target` can live there — on an ordered range that's a plain range test: `nums[lo] <= target < nums[mid]` on the left, `nums[mid] < target <= nums[hi]` on the right. If yes, keep that half; if no, the target can only be in the other half.

The disordered half is never asked anything: its ends say nothing about what's inside it. Every step discards half the range, so the loop ends after `O(log n)` steps, either at the target or with an empty range and `-1`.

**The two-pass alternative.** First binary-search for the smallest element (compare `nums[mid]` with `nums[hi]`: if `nums[mid] > nums[hi]`, the drop is to the right of `mid`). That index splits the list into two sorted runs; binary-search the one whose range covers `target`. Same `O(log n)`, more code, but each piece is a textbook search — a fair trade if the one-pass branches feel slippery under pressure.

## Complexity

`O(log n)` time: each step halves the range. `O(1)` extra space.

## Pitfalls

- `nums[lo] < nums[mid]` with a strict `<`. When two elements remain, `lo == mid` and the left half is the single element `nums[lo]` — ordered, trivially. The strict test says it isn't, and `[6,2]` searching for `2` returns `-1`.
- Getting the range ends wrong: `target == nums[lo]` belongs to the left half, `target == nums[hi]` to the right one. Write the inequalities so each half's ends are included and `mid` (already checked) isn't.
- Steering by `target < nums[mid]` alone, as in ordinary binary search: across the drop, a smaller target may well be to the right.
