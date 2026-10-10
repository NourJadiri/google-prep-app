# Longest Increasing Subsequence

## The task

Given an integer array `nums`, return the length of its longest strictly increasing subsequence.

A subsequence keeps some of the elements — at least one, possibly all — in their original order; they don't have to be next to each other. Strictly increasing means each kept element is larger than the one kept before it, so two equal values can't both be used.

## Examples

**Example 1**

```
nums = [2,9,3,4,1,5]   -> 4
```

`2, 3, 4, 5`. Jumping from 2 straight to 9 looks promising, but nothing bigger follows the 9.

**Example 2**

```
nums = [1,3,3,2,4]   -> 3
```

`1, 3, 4` or `1, 2, 4`. The two 3s can't both be kept: `3, 3` isn't strictly increasing.

**Example 3**

```
nums = [9,4,1,-2]   -> 1
```

Nothing ever increases, but any single element is a subsequence of length 1.

## Constraints

- `1 <= nums.length <= 2500`
- `-10^4 <= nums[i] <= 10^4`

## Aim for

Start with the `O(n^2)` DP: `dp[i]` = the length of the longest increasing subsequence that **ends at** index `i`, so `dp[i] = 1 + max(dp[j])` over `j < i` with `nums[j] < nums[i]` (or 1 if there's none), and the answer is `max(dp)` — not `dp[-1]`. Then expect "can you do better?": `O(n log n)` by keeping, for each length, the smallest value that can end an increasing subsequence of that length. That list stays sorted, so each new number finds its place by binary search.

## Follow-ups

- Return one longest subsequence, not just its length.
- Count how many longest increasing subsequences there are.
- Longest *non-decreasing* subsequence: what changes in each solution?
- Envelopes `(w, h)` nest when both sides are strictly smaller. How many can you nest? (Russian Doll Envelopes.)
