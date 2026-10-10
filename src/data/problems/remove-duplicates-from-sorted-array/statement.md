# Remove Duplicates from Sorted Array

## The task

You're given a list of integers `nums`, sorted in non-decreasing order, which may contain repeats. Let `k` be the number of distinct values in it.

Rearrange `nums` **in place** so that its first `k` slots hold each distinct value exactly once, in sorted order, and return `k`. Whatever is left in the slots from index `k` onward doesn't matter. Use only `O(1)` extra memory: no second list.

The tests call your function, check that it returned `k` as an `int` between `1` and `len(nums)`, and then compare `nums[:k]` with the expected values. So each example shows `nums[:k]` after your call, not `k` itself.

## Examples

**Example 1**

```
nums = [2,2,5,9,9,9]   -> [2,5,9]
```

Return `3`. Afterwards `nums` starts with `2,5,9`; the last three slots can hold anything.

**Example 2**

```
nums = [7,7,7,7]   -> [7]
```

One distinct value, so return `1`.

**Example 3**

```
nums = [-3,-1,0,4]   -> [-3,-1,0,4]
```

No repeats at all: return `4`, and the list can stay exactly as it is.

## Constraints

- `1 <= nums.length <= 3 * 10^4`
- `-100 <= nums[i] <= 100`
- `nums` is sorted in non-decreasing order.

## Aim for

`O(n)` time and `O(1)` extra space. Because the list is sorted, copies of a value always sit next to each other, so you can tell whether a value is new by comparing it with the last value you decided to keep. Use one index that reads every element and another that marks where the next new value should be written.

## Follow-ups

- Allow each value to appear at most twice. What do you compare against now?
- The list isn't sorted any more. What does removing duplicates cost, and can you keep the original order?
- Remove every copy of one given value `val` instead.
