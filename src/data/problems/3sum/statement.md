# 3Sum

## The task

Given an integer list `nums`, return every **distinct** triple of values `[a, b, c]` that sums to zero, where the three values come from three different positions of `nums`.

Two triples count as the same when they hold the same three values, regardless of which positions they came from — report each such triple once. The triples may come back in any order, and so may the values inside each one. If no triple works, return `[]`.

## Examples

**Example 1**

```
nums = [3,-1,-2,-1,2,0]   -> [[-2,-1,3],[-2,0,2],[-1,-1,2]]
```

Either `-1` can pair with `-2` and `3`, but that's one triple, reported once. `[-1,-1,2]` uses both copies of `-1`, which is allowed: they sit at different positions.

**Example 2**

```
nums = [-4,2,3]   -> []
```

`-4 + 2 + 2` would be zero, but there is only one `2`, and a position can't be used twice.

**Example 3**

```
nums = [5,-5,0,0,5,-5,0]   -> [[-5,0,5],[0,0,0]]
```

## Constraints

- `3 <= nums.length <= 3000`
- `-10^5 <= nums[i] <= 10^5`

## Aim for

`O(n^2)` time. Sort, then fix the smallest value `nums[i]` and find pairs summing to `-nums[i]` in the rest with two pointers moving inward. Skip an anchor equal to the one before it, and after a hit step past copies of the middle value — that removes duplicates without a set. Checking every triple is `O(n^3)`, billions of steps at this size.

## Follow-ups

- Return the triple whose sum is closest to a given target instead (3Sum Closest).
- Generalise to 4Sum, then k-sum. What does each extra number cost?
- Solve it without sorting, using a hash set per anchor. How do you avoid duplicate triples then, and what does that cost?
