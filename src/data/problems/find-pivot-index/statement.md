# Find Pivot Index

## The task

Given a list of integers `nums`, find a **pivot index**: an index `i` where the sum of the elements strictly to the left of `i` equals the sum of the elements strictly to the right of it. The element at `i` belongs to neither side, and a side with no elements sums to `0`.

Return the leftmost pivot index, or `-1` if there isn't one.

## Examples

**Example 1**

```
nums = [2,3,0,0,5]   -> 2
```

At index `2`: `2 + 3 = 5` on the left, `0 + 5 = 5` on the right. Index `3` balances too (`5` against `5`), but `2` is further left.

**Example 2**

```
nums = [4,-4,9]   -> 2
```

Nothing is to the right of index `2`, so that side sums to `0`, and so does the left: `4 + (-4) = 0`.

**Example 3**

```
nums = [3,1,4]   -> -1
```

The left sums are `0, 3, 4` and the right sums are `5, 4, 0`. They never match up.

## Constraints

- `1 <= nums.length <= 10^4`
- `-1000 <= nums[i] <= 1000`

## Aim for

Adding up both sides again for every index is `O(n^2)`. You can get `O(n)` time and `O(1)` extra space: add up the whole list once, then sweep from left to right keeping a running sum of the left side. If you know the total, the left sum and `nums[i]`, what's the right sum?

## Follow-ups

- Return every pivot index, not just the leftmost.
- No index balances exactly. Find the one where the two sides come closest.
- The values are floats instead of integers. Why is checking `left == right` risky now?
