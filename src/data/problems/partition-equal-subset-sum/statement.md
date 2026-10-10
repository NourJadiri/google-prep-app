# Partition Equal Subset Sum

## The task

Given a list of positive integers `nums`, decide whether it can be split into two groups with equal sums. Every element must go into exactly one of the two groups. Return `True` if such a split exists and `False` otherwise.

## Examples

**Example 1**

```
nums = [3,1,4,2,2]   -> true
```

The total is 12, so each group must sum to 6: `{4, 2}` and `{3, 1, 2}`.

**Example 2**

```
nums = [2,2,3,5]   -> false
```

The total, 12, is even, but no group of these numbers adds up to 6.

**Example 3**

```
nums = [1,2,4]   -> false
```

An odd total can never be split into two equal halves.

## Constraints

- `1 <= nums.length <= 200`
- `1 <= nums[i] <= 100`

## Aim for

If the total is odd, stop. Otherwise this is subset sum: can some subset hit `target = total / 2`? The numbers left over then make the other half automatically. Keep a boolean array `can[s]` for the sums `0..target`, start with `can[0] = True`, and fold the numbers in one at a time, sweeping `s` **downward** so each number is used at most once. `O(n · target)` time — at most 200 · 10,000 — and `O(target)` space. Trying every subset is `2^n`.

## Follow-ups

- Return the two groups, not just whether they exist.
- Split into `k` groups with equal sums (Partition to K Equal Sum Subsets). Why doesn't this table extend to it?
- Make the two groups' sums as close as possible.
- In Python, one big integer can serve as the table: `bits |= bits << x`. Why does that work, and why is it so fast?
