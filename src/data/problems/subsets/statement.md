# Subsets

## The task

Given a list `nums` of **distinct** integers, return all of its subsets: every way of picking zero or more of its elements, from none of them up to all of them. Each subset must appear exactly once. Return the subsets in any order, with the numbers inside each subset in any order too.

## Examples

**Example 1**

```
nums = [5,-2,7]   -> [[],[5],[-2],[7],[5,-2],[5,7],[-2,7],[5,-2,7]]
```

Each of the three numbers is either in or out, so there are `2^3 = 8` subsets, counting the empty one and the whole list.

**Example 2**

```
nums = [0]   -> [[],[0]]
```

## Constraints

- `1 <= nums.length <= 10`
- `-10 <= nums[i] <= 10`
- All the numbers in `nums` are distinct.

## Aim for

There are `2^n` subsets of average size `n / 2`, so `O(n · 2^n)` is the size of the answer and the time to aim for. Backtracking: `backtrack(start)` records the current path as a subset, then for each `i >= start` chooses `nums[i]`, explores from `i + 1`, and un-chooses. Moving only forward is what keeps `[5,7]` and `[7,5]` from both appearing. Have the bitmask version ready too: for each `mask` from `0` to `2^n - 1`, bit `i` says whether `nums[i]` is in.

## Follow-ups

- `nums` may contain duplicates; return each distinct subset once. (Sort, then skip a repeated value at the same depth.)
- Only subsets of exactly `k` elements. Where do you prune?
- Produce the subsets lazily, one at a time, without holding all `2^n` in memory.
