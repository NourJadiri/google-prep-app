# House Robber II

## The task

The houses on a ring road are numbered `0` to `n - 1`, and house `i` keeps `nums[i]` dollars. Because the road is a loop, house `n - 1` stands next to house `0` as well as next to house `n - 2`. Every pair of next-door houses shares an alarm, so you may never rob two neighbours on the same night. Return the largest total you can take.

A street with a single house has no neighbours: you may rob it.

## Examples

**Example 1**

```
nums = [7,2,3,9,1,6]   -> 17
```

Rob houses 1, 3 and 5 for `2 + 9 + 6 = 17`. On a straight street `7 + 9 + 6 = 22` would be allowed, but here houses 0 and 5 are neighbours.

**Example 2**

```
nums = [6,2,9]   -> 9
```

On a ring of three, every pair of houses is next door, so you get exactly one house: the richest.

**Example 3**

```
nums = [5]   -> 5
```

## Constraints

- `1 <= nums.length <= 100`
- `0 <= nums[i] <= 1000`

## Aim for

Break the circle. Houses `0` and `n - 1` are neighbours, so any valid plan leaves at least one of them alone — the answer is the better of two straight-street problems, houses `0..n-2` and houses `1..n-1`. Each is the classic line version: walk left to right carrying two numbers, the best total with the previous house robbed and with it skipped. `O(n)` time, `O(1)` extra space. Mind `n = 1`, where both streets are empty.

## Follow-ups

- The houses form a binary tree and a parent and child can't both be robbed (House Robber III).
- Return which houses to rob, not just the total.
- The alarms also link houses two doors apart. What changes in the recurrence?
