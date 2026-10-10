# Two Sum

## The task

You're given a list of integers `nums` and an integer `target`. Exactly one pair of **different positions** `i` and `j` has `nums[i] + nums[j] == target`. Return those two indices, in either order.

The same position can't be used twice, but two different positions may hold the same value.

## Examples

**Example 1**

```
nums = [4,9,2,6], target = 10   -> [0,3]
```

`4 + 6 = 10`, and no other pair gets there.

**Example 2**

```
nums = [-3,8,5,11], target = 2   -> [0,2]
```

Negatives count: `-3 + 5 = 2`.

**Example 3**

```
nums = [7,7], target = 14   -> [0,1]
```

Two different positions, same value — allowed.

## Constraints

- `2 <= nums.length <= 10^4`
- `-10^9 <= nums[i], target <= 10^9`
- Exactly one valid pair exists.

## Aim for

Checking every pair is `O(n^2)` — say it, then beat it. One pass with a hash map from value to index: for each `x`, ask whether `target - x` has already been seen. `O(n)` time, `O(n)` space.

## Follow-ups

- The list arrives sorted. Can you drop the extra memory?
- Return every pair that works, not just one — what changes in the bookkeeping?
