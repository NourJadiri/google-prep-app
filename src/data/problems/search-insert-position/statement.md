# Search Insert Position

## The task

You're given a list of integers `nums`, sorted in increasing order with no repeated values, and an integer `target`. If `target` is in `nums`, return its index. If it isn't, return the index where it would have to be inserted to keep the list sorted. That index is the same as the number of values in `nums` smaller than `target`.

Your solution should run in `O(log n)` time.

## Examples

**Example 1**

```
nums = [-5,0,8,13], target = 8   -> 2
```

`8` is already in the list, at index 2.

**Example 2**

```
nums = [10,20,30,40,50], target = 35   -> 3
```

`35` belongs between `30` and `40`. Inserting it at index 3 gives `[10,20,30,35,40,50]`.

**Example 3**

```
nums = [3,6,9], target = 12   -> 3
```

`12` is bigger than everything, so it goes at the very end. Index 3 is one past the last index, and that's a valid answer.

## Constraints

- `1 <= nums.length <= 10^4`
- `-10^4 <= nums[i], target <= 10^4`
- The values in `nums` are distinct and sorted in increasing order.

## Aim for

This is Binary Search with one twist: when `target` isn't there, you still have to say where it would go. Run the usual loop, and ask what your two indices tell you when it finishes without finding anything. Trace a few small cases by hand, including a target smaller than everything and one bigger than everything. That's `O(log n)` time and `O(1)` space.

## Follow-ups

- The list may contain duplicates. Return the first position where `target` could be inserted, and then the last.
- In a sorted list with duplicates, find the first and last index of `target`.
- Python's `bisect` module answers this in a single call. Which function is it, and how would you explain what it does?
