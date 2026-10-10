# Maximum Average Subarray I

## The task

You're given a list of integers `nums` and an integer `k`. Look at every run of exactly `k` consecutive elements, and return the largest average any of them has.

The answer is a float. Anything within `10^-5` of the exact value is accepted.

## Examples

**Example 1**

```
nums = [4,-1,7,2,-5,6], k = 2   -> 4.5
```

The runs of two sum to `3, 6, 9, -3, 1`. The best is `[7,2]`: a sum of `9`, an average of `4.5`.

**Example 2**

```
nums = [-5,-1,-3,-8], k = 2   -> -2.0
```

Every run has a negative average. The best of them is `-2.0`, from `[-1,-3]`.

**Example 3**

```
nums = [9,0,2,1], k = 4   -> 3.0
```

When `k` equals the length, there's only one run: the whole list.

## Constraints

- `n == nums.length`
- `1 <= k <= n <= 10^5`
- `-10^4 <= nums[i] <= 10^4`

## Aim for

Adding up every run from scratch is `O(n * k)`, far too slow when both are large. Notice that when the window of `k` elements slides one step to the right, only two elements change. Aim for `O(n)` time and `O(1)` extra space, and divide by `k` just once, at the end.

## Follow-ups

- Also return where the best run starts.
- With every value positive, find the shortest run whose sum is at least some target. (The window now grows and shrinks.)
- Runs of length *at least* `k` instead of exactly `k`. Why does that make the problem much harder?
