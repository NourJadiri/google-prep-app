# Kth Largest Element in an Array

## The task

Given an integer list `nums` and an integer `k`, return the value that would sit at position `k` (counting from 1) if `nums` were sorted from largest to smallest.

Duplicates count separately. In `[5,5,3]` the 1st and the 2nd largest are both `5`. You want the `k`-th largest *element*, not the `k`-th largest distinct value.

## Examples

**Example 1**

```
nums = [7,2,9,4,9,1], k = 2   -> 9
```

Sorted from largest: `9, 9, 7, 4, 2, 1`. Both copies of `9` count, so the 2nd largest is `9` again.

**Example 2**

```
nums = [-5,3,0,-1], k = 4   -> -5
```

When `k` equals the length, the answer is the minimum.

**Example 3**

```
nums = [2,2,2], k = 2   -> 2
```

## Constraints

- `1 <= k <= nums.length <= 10^5`
- `-10^4 <= nums[i] <= 10^4`

## Aim for

Sorting is `O(n log n)`. Mention it, then beat it. A min-heap holding the `k` largest values seen so far gives `O(n log k)`. The expected-linear answer is quickselect: partition around a pivot, then continue into only the side that holds index `n - k` of the ascending order. Choose the pivot at random, since a fixed pivot goes quadratic on sorted input. Partition three ways (less / equal / greater), or an array full of one value goes quadratic too.

## Follow-ups

- Quickselect is still `O(n^2)` in the worst case. How do you guarantee `O(n)`? (Median of medians.)
- The values arrive as a stream, and after each one you must report the current `k`-th largest.
- Every value lies in `[-10^4, 10^4]`. Can you use that? (A counting array: `O(n + range)`.)
