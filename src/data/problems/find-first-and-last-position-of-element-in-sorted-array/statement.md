# Find First and Last Position of Element in Sorted Array

## The task

`nums` is sorted in non-decreasing order, so equal values sit side by side in a run. Return `[first, last]`: the index of the first and of the last occurrence of `target`. If `target` doesn't occur at all, return `[-1, -1]`.

Your search must run in `O(log n)` time — even when `target` fills most of the list — and the large tests check it: each searches one array ten thousand times, one call per target. Such a test lists all its targets together as `target = [...]`; your function still receives a single integer on every call.

## Examples

**Example 1**

```
nums = [1,3,3,3,6,9], target = 3   -> [1,3]
```

The run of `3`s covers indices `1` through `3`.

**Example 2**

```
nums = [2,4,4,8], target = 5   -> [-1,-1]
```

`5` would fit between the `4`s and the `8`, but it isn't there.

**Example 3**

```
nums = [], target = 7   -> [-1,-1]
```

An empty list contains nothing.

## Constraints

- `0 <= nums.length <= 10^5`
- `-10^9 <= nums[i], target <= 10^9`
- `nums` is sorted in non-decreasing order.
- A large test makes up to `10^4` calls on the same `nums`.

## Aim for

`O(log n)` time and `O(1)` space with two binary searches that don't stop when they hit `target`: one for the first index whose value is `>= target`, one for the last index whose value is `<= target` (or, reusing one helper, the first index whose value is `>= target + 1`, minus one). Finding any copy and walking outward is `O(n)` when the run is long — the large tests have runs ten thousand long.

## Follow-ups

- How many times does `target` occur? (One subtraction away.)
- Write a single `lower(x)` helper and get both ends from it. Why does `target + 1` work here, and why wouldn't it for floats or strings?
- The sorted data lives on disk in 4 KB blocks, and each probe costs a disk read. How would you cut the number of reads?
