# Single Number

## The task

The values in the list `nums` come in pairs: each appears **exactly twice** — except one value, which has no partner and appears **exactly once**. Return that value. The list is never empty.

## Examples

**Example 1**

```
nums = [7,3,5,3,7]   -> 5
```

`7` and `3` each have a twin somewhere in the list; `5` is on its own.

**Example 2**

```
nums = [-2,9,9]   -> -2
```

Negative numbers follow the same rule.

**Example 3**

```
nums = [6]   -> 6
```

In a list of one, that number is the single one.

## Constraints

- `1 <= nums.length <= 3 * 10^4`
- `-3 * 10^4 <= nums[i] <= 3 * 10^4`
- Every value appears exactly twice, except one value that appears exactly once.

## Aim for

A set or a dictionary of counts solves it in `O(n)` time but `O(n)` extra space — say that first. The real target is `O(n)` time with `O(1)` extra space, and that takes a trick: find an operation under which two equal numbers **cancel out**, whatever order they come in, while anything combined with "nothing" stays itself. Look up what the XOR operator, `^`, does to a number and itself.

## Follow-ups

- Every value appears three times except one, which appears once. Why does the XOR trick stop working, and what could replace it?
- Two values appear once and all the others appear twice. Find both, still in `O(1)` extra space.
