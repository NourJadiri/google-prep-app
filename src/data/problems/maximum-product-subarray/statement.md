# Maximum Product Subarray

## The task

Given an integer array `nums`, find the contiguous, non-empty subarray whose elements have the largest product, and return that product.

The subarray must contain at least one element, so the answer can be negative — for instance when `nums` is a single negative number.

## Examples

**Example 1**

```
nums = [2,-5,-2,-4,3]   -> 24
```

`-2 · -4 · 3 = 24`. Two negatives multiply to a positive, so a very negative running product can suddenly become the best one.

**Example 2**

```
nums = [-1,-2,0,5,-1,-3]   -> 15
```

Every subarray that contains the zero has product 0, so the zero splits the array in two. The best product lies to its right: `5 · -1 · -3 = 15`.

**Example 3**

```
nums = [-4]   -> -4
```

At least one element must be taken, even a negative one.

## Constraints

- `1 <= nums.length <= 2 * 10^4`
- `-10 <= nums[i] <= 10`
- The product of every contiguous subarray fits in a 32-bit signed integer.

## Aim for

Kadane's algorithm with a twist: multiplying by a negative number turns the smallest product into the largest. Walk once, tracking both the largest and the smallest product of a subarray *ending at* the current element; for each `x` the new pair comes from `x`, `x · old_max` and `x · old_min`. `O(n)` time, `O(1)` space. Checking every subarray is `O(n^2)` — too slow at 20,000 elements.

## Follow-ups

- Return where the subarray starts and ends, not just its product.
- Solve it with a running prefix product and a running suffix product, restarting after zeros. Why is the best subarray always a prefix or a suffix of a zero-free stretch?
- The elements may be fractions such as `0.5`. Which of the two approaches still works?
