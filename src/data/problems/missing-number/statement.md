# Missing Number

## The task

The list `nums` holds `n` **different** integers, all between `0` and `n` inclusive. That range has `n + 1` numbers in it, so exactly one of them is absent from the list. Return the absent number.

The list can be in any order.

## Examples

**Example 1**

```
nums = [4,0,3,1]   -> 2
```

`n = 4`, so the full range is `0` to `4`. Only `2` is absent.

**Example 2**

```
nums = [0,1,2]   -> 3
```

The missing number can be `n` itself, the top of the range.

**Example 3**

```
nums = [1]   -> 0
```

It can also be `0`, the bottom of the range.

## Constraints

- `n == nums.length`
- `1 <= n <= 10^4`
- `0 <= nums[i] <= n`
- All the numbers in `nums` are different.

## Aim for

Sorting and scanning works in `O(n log n)`, and a set of the numbers works in `O(n)` time with `O(n)` space. Aim for `O(n)` time and `O(1)` extra space. Here's the nudge: you already know exactly what the **complete** collection `0, 1, …, n` adds up to, without looking at the list at all. How does the list's own total compare?

## Follow-ups

- In Java or C++ that total can overflow for big inputs. How does XOR avoid the problem?
- Two numbers are missing from `0` to `n + 1`, with `n` numbers given. Find both.
