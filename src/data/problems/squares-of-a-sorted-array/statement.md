# Squares of a Sorted Array

## The task

You're given a list of integers `nums`, sorted in non-decreasing order. It may contain negative numbers. Return a new list holding the square of every element, also sorted in non-decreasing order.

## Examples

**Example 1**

```
nums = [-6,-2,1,3,5]   -> [1,4,9,25,36]
```

Squaring scrambles the order: `-6` was the smallest value, but its square, `36`, is the largest.

**Example 2**

```
nums = [-9,-4,-4]   -> [16,16,81]
```

Everything is negative, so the squares come out in the reverse of the input's order.

**Example 3**

```
nums = [7]   -> [49]
```

## Constraints

- `1 <= nums.length <= 10^4`
- `-10^4 <= nums[i] <= 10^4`
- `nums` is sorted in non-decreasing order.

## Aim for

Squaring everything and sorting is `O(n log n)`, a perfectly good first answer, so say it out loud. Then get to `O(n)`: in a sorted list, where can the *largest* square be? Only at one of the two ends. Put a pointer at each end and fill the answer from the back.

## Follow-ups

- Instead of squaring, apply `f(x) = a*x^2 + b*x + c` for given `a`, `b` and `c`. Does the two-ends idea still work? What changes when `a` is negative?
- Return only the `k` smallest squares, without building the whole list.
