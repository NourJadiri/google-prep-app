# Search in Rotated Sorted Array

## The task

`nums` began as a list of **distinct** integers in increasing order and was then rotated: some prefix was cut off and moved, in order, to the end — `[1,2,3,4,5]` might now read `[4,5,1,2,3]`. The rotation may be zero, leaving the list sorted. You aren't told where the cut was.

Return the index of `target` in `nums`, or `-1` if it isn't there.

Your search must run in `O(log n)` time, and the large tests check it: each searches one array ten thousand times, one call per target. Such a test lists all its targets together as `target = [...]`; your function still receives a single integer on every call.

## Examples

**Example 1**

```
nums = [15,18,22,3,7,11], target = 7   -> 4
```

This is `[3,7,11,15,18,22]` with its first three numbers moved to the back; `7` now sits at index `4`.

**Example 2**

```
nums = [30,40,50,10,20], target = 35   -> -1
```

**Example 3**

```
nums = [2,4,6,8,10], target = 10   -> 4
```

A rotation of zero: the list is plainly sorted, and the search must still work.

## Constraints

- `1 <= nums.length <= 10^5`
- `-10^9 <= nums[i], target <= 10^9`
- The values in `nums` are distinct.
- `nums` is an increasing list rotated by some amount from `0` to `nums.length - 1`.
- A large test makes up to `10^4` calls on the same `nums`.

## Aim for

`O(log n)` time, `O(1)` space: a binary search whose every step first asks which half of `[lo, hi]` is in order — compare `nums[lo]` with `nums[mid]`. A range check is only trustworthy on the ordered half: if `target` lies within its ends, keep that half, otherwise keep the other one. A linear scan is `O(n)` per call and runs out of time on the large tests.

## Follow-ups

- Values may now repeat (`[3,3,3,1,3]`). Where does the which-half-is-sorted test break, and what is the worst case?
- Return how far the list was rotated — the index of its smallest element.
- Solve it as two plain binary searches: find the smallest element, then search the correct piece. Which version would you rather debug on a whiteboard?
