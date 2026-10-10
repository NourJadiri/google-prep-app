# Contains Duplicate

## The task

You're given a list of integers `nums`. Return `True` if some value shows up **two or more times**, and `False` if all the values are different.

Only values matter, not positions: two equal numbers make a duplicate wherever they sit in the list, next to each other or far apart.

## Examples

**Example 1**

```
nums = [3,8,1,8,5]   -> true
```

`8` appears at index 1 and again at index 3.

**Example 2**

```
nums = [10,-4,7,0]   -> false
```

Four numbers, four different values.

**Example 3**

```
nums = [42]   -> false
```

A single number has nothing to repeat.

## Constraints

- `1 <= nums.length <= 10^5`
- `-10^9 <= nums[i] <= 10^9`

## Aim for

Comparing every number with every other number is correct, but that's about `n^2 / 2` comparisons — billions for `10^5` numbers. Instead, walk the list **once** and remember what you've already seen, in something that can answer "have I seen this value before?" instantly. That gives `O(n)` time for `O(n)` extra memory. If memory were tight, think about what sorting puts next to each other.

## Follow-ups

- You may only use a few extra variables, no set. What does sorting buy you, and what does it cost?
- Return `True` only when two equal values are at most `k` positions apart.
- Return the first value whose second copy shows up earliest, instead of just `True` or `False`.
