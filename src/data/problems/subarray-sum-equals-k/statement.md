# Subarray Sum Equals K

## The task

Given an integer list `nums` and an integer `k`, count the **subarrays** — contiguous, non-empty runs `nums[i..j]` — whose elements add up to exactly `k`.

Subarrays at different positions count separately, even when they hold the same values or overlap. The numbers may be negative or zero.

## Examples

**Example 1**

```
nums = [2,-1,1,3,-2], k = 3   -> 3
```

`[3]`, `[-1,1,3]` and the whole list `[2,-1,1,3,-2]` each sum to `3`.

**Example 2**

```
nums = [1,-1,1,-1], k = 0   -> 4
```

`[1,-1]` at positions `0..1` and again at `2..3`, `[-1,1]` at `1..2`, and the whole list.

**Example 3**

```
nums = [3,3,3], k = 6   -> 2
```

`[3,3]` starting at index `0` and at index `1`: they overlap, and both count.

## Constraints

- `1 <= nums.length <= 2 * 10^4`
- `-1000 <= nums[i] <= 1000`
- `-10^7 <= k <= 10^7`

## Aim for

`O(n)` time and space with prefix sums and a hash map. The sum of `nums[i..j]` is `prefix[j+1] - prefix[i]`, so as you sweep, add up how many earlier prefixes equal `current - k`, seeding the map with the empty prefix `{0: 1}`. Trying every subarray is `O(n^2)` — 200 million sums at this size. A sliding window doesn't apply: with negative numbers, growing a window doesn't grow its sum.

## Follow-ups

- Return the length of the longest subarray summing to `k` instead. What goes in the map now, and should a later index overwrite an earlier one?
- Count the subarrays whose sum is divisible by `k`.
- If every number were positive, what `O(1)`-space method would work, and exactly why does it break here?
