# Container With Most Water

## The task

You get an array `height` of `n` non-negative integers. Picture `n` vertical walls standing on a flat floor at positions `0, 1, …, n - 1`. Wall `i` is `height[i]` tall and has no thickness.

Choose two walls `i < j`. Together with the floor they hold water up to the height of the shorter wall, so they hold `min(height[i], height[j]) * (j - i)` units. The walls between them don't get in the way. Return the most water any pair of walls can hold.

## Examples

**Example 1**

```
height = [3,1,6,2,5,4]   -> 15
```

The two end walls hold `min(3, 4) * 5 = 15`. The two tallest walls, `6` and `5`, hold only `5 * 2 = 10`, so width matters as much as height.

**Example 2**

```
height = [4,0,0,0,4]   -> 16
```

The walls in between don't count: `4 * 4 = 16`.

**Example 3**

```
height = [0,7]   -> 0
```

A wall of height zero holds nothing.

## Constraints

- `2 <= height.length <= 10^5`
- `0 <= height[i] <= 10^4`

## Aim for

Trying all pairs is `O(n^2)`, too slow for `10^5` walls. Use two pointers, one at each end, for `O(n)` time and `O(1)` space: record the current area, then move the pointer at the **shorter** wall inward. Be ready to argue why throwing that wall away can never lose the best answer.

## Follow-ups

- Prove the two-pointer rule. Why is it safe to discard the shorter wall, and what happens when both walls are equal?
- Return the pair of indices instead of the amount.
- How does this differ from Trapping Rain Water, where every bar holds water above it?
