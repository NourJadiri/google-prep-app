# Split Array Largest Sum

## The task

You're given an array `nums` of non-negative integers and an integer `k`. Cut `nums` into exactly `k` non-empty pieces, each a contiguous run of the array, so that every element lands in exactly one piece. A cut's cost is its largest piece sum. Return the smallest cost any cut can achieve.

Think of `nums[i]` as the length of chapter `i` of a manuscript and `k` as the number of proofreaders. Each proofreader takes a contiguous block of chapters, and you want the busiest one's workload to be as small as possible.

## Examples

**Example 1**

```
nums = [6,2,9,3,4], k = 2   -> 16
```

`[6,2] | [9,3,4]` has piece sums `8` and `16`. Every other cut does worse; for example, `[6,2,9] | [3,4]` costs `17`.

**Example 2**

```
nums = [1,1,1,1], k = 4   -> 1
```

When `k` equals the length, every element is a piece of its own, and the cost is the largest element.

**Example 3**

```
nums = [0,0,5,0], k = 3   -> 5
```

The zeros still have to land in non-empty pieces, but nothing can beat the piece that holds the `5`.

## Constraints

- `1 <= nums.length <= 1000`
- `0 <= nums[i] <= 10^6`
- `1 <= k <= nums.length`

## Aim for

`O(n log S)`, where `S = sum(nums)`. Turn the question around. Instead of searching for the best cut, ask: "can `nums` be cut into at most `k` pieces with no piece summing to more than `cap`?" One greedy pass answers that: keep adding to the current piece until the next number would overflow it. The answer flips from no to yes exactly once as `cap` grows, so binary search `cap` between `max(nums)` and `sum(nums)`. A DP over (pieces used, prefix length) is the other classic answer, at `O(k n^2)`. Know it, and know why it loses here.

## Follow-ups

- Prove the greedy check: why does packing each piece as full as possible never need more pieces than any other cut?
- Return the cut positions, not just the cost.
- Allow negative numbers. Which part of your solution breaks?
