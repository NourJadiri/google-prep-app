# Contains Duplicate II

## The task

Given a list of integers `nums` and an integer `k`, return `True` if there are two **different** indices `i` and `j` with `nums[i] == nums[j]` and `abs(i - j) <= k`. Otherwise return `False`.

In other words: do two equal values ever sit at most `k` positions apart?

## Examples

**Example 1**

```
nums = [5,8,3,8,1], k = 2   -> true
```

The two `8`s are at indices `1` and `3`: two apart, and `2 <= k`.

**Example 2**

```
nums = [6,2,9,6], k = 2   -> false
```

The `6`s are at indices `0` and `3`: three apart, one too many.

**Example 3**

```
nums = [4,4], k = 0   -> false
```

With `k = 0` the two indices would have to be the same, but they must be different. No pair can ever count.

## Constraints

- `1 <= nums.length <= 10^5`
- `-10^9 <= nums[i] <= 10^9`
- `0 <= k <= 10^5`

## Aim for

Comparing each element with the next `k` is `O(n * k)`, too slow when both are large. Walk the list once and remember where you last saw each value: when a value turns up again, is its previous copy close enough? That's `O(n)` time.

## Follow-ups

- Use only `O(min(n, k))` extra memory.
- Now two values count as a match if they differ by at most `t`. Can you still do it quickly?
- Return the smallest distance between two equal values.
