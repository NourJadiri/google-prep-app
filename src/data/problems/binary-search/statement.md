# Binary Search

## The task

You're given a list of integers `nums`, sorted in increasing order with no repeated values, and an integer `target`. Return the index where `target` appears in `nums`, or `-1` if it isn't there.

Your solution should run in `O(log n)` time.

## Examples

**Example 1**

```
nums = [-8,-3,0,4,11,15,23], target = 11   -> 4
```

`nums[4]` is `11`.

**Example 2**

```
nums = [2,5,7,13], target = 6   -> -1
```

`6` would go between `5` and `7`, but it isn't in the list.

**Example 3**

```
nums = [42], target = 42   -> 0
```

With only one element, the search is down to a single candidate straight away, and that candidate still has to be checked.

## Constraints

- `1 <= nums.length <= 10^4`
- `-10^4 < nums[i], target < 10^4`
- The values in `nums` are distinct and sorted in increasing order.

## Aim for

Checking every element is `O(n)`. Because the list is sorted, comparing `target` with the middle element tells you which half it must be in, so you can throw the other half away. Keep two indices that mark the part of the list that could still hold the target, and shrink that part until you find the target or nothing is left. Pin down exactly what your two indices mean, and that will tell you the loop condition and how to move them. That's `O(log n)` time and `O(1)` space.

## Follow-ups

- The list may contain duplicates. Return the first index where `target` appears.
- The sorted list has been rotated, for example to `[11,15,23,-8,-3,0,4]`. Can you still search it in `O(log n)`?
- You don't know how long the list is. All you know is that reading past the end gives a huge placeholder value. How do you find a range to search?
