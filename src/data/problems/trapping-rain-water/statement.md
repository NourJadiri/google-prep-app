# Trapping Rain Water

## The task

The list `height` describes a row of bars, each `1` unit wide, standing side by side with no gaps: bar `i` is `height[i]` units tall. Rain falls on the row and collects in the dips between bars; any water that isn't walled in on both sides runs off the ends of the row. Return how many units of water stay trapped.

Water is measured in unit squares: above a bar of height `1`, water standing at level `3` counts `2`.

## Examples

**Example 1**

```
height = [3,0,1,0,2]   -> 5
```

The right-hand bar of height `2` is the lower wall, so water settles at level `2` over positions `1` to `3`: `2 + 1 + 2 = 5`. The left wall is taller, but water above level `2` would spill over the right end.

**Example 2**

```
height = [2,0,4,1,3]   -> 4
```

Two separate pools: `2` units between the `2` and the `4`, and `2` more between the `4` and the `3`.

**Example 3**

```
height = [1,2,3,2,1]   -> 0
```

A hill holds nothing: every drop runs downhill and off an end.

## Constraints

- `1 <= height.length <= 2 * 10^4`
- `0 <= height[i] <= 10^5`

## Aim for

`O(n)` time and `O(1)` space with two pointers. The water above a bar rises to the smaller of the tallest bar on its left and the tallest bar on its right. Walk inward from both ends, always moving the side whose bar is lower: that side's running maximum alone fixes its level, because the other side already has a bar at least as tall. Prefix and suffix maximum arrays give `O(n)` with `O(n)` space; recomputing both maxima for every bar is `O(n^2)`.

## Follow-ups

- Solve it with a monotonic stack that fills the water in horizontal layers. How does that compare with two pointers?
- The bars become a 2D height map and water can escape in four directions. Why do two pointers stop working, and what takes their place?
- Bars are appended on the right one at a time, and the trapped total is wanted after each one.
