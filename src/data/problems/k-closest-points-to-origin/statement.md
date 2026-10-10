# K Closest Points to Origin

## The task

You're given points on the plane, `points[i] = [x, y]`, and an integer `k`. Return the `k` points closest to the origin `(0, 0)`, by ordinary straight-line distance: the point `[x, y]` is `sqrt(x^2 + y^2)` away.

Return the points as `[x, y]` pairs, in any order. If the same coordinates appear more than once and the copies make the cut, return every copy.

There is never a tie at the cut: the `k`-th closest point is strictly closer than every point left out, so exactly one set of points is correct.

## Examples

**Example 1**

```
points = [[4,-1],[-2,2],[0,-3],[5,0]], k = 2   -> [[-2,2],[0,-3]]
```

The squared distances are `17`, `8`, `9` and `25`. The two smallest belong to `[-2,2]` and `[0,-3]`; returning them in the other order is just as good.

**Example 2**

```
points = [[0,5],[3,3]], k = 1   -> [[3,3]]
```

`[3,3]` is `sqrt(18)`, about `4.24`, from the origin, while `[0,5]` is `5` away. Fewer grid steps doesn't mean closer.

**Example 3**

```
points = [[1,2],[-3,0],[1,2]], k = 2   -> [[1,2],[1,2]]
```

Both copies of `[1,2]` (squared distance `5`) beat `[-3,0]` (`9`), so both are returned.

## Constraints

- `1 <= k <= points.length <= 10^4`
- `-10^4 <= x, y <= 10^4`
- When `k < points.length`, the `k`-th smallest distance is strictly smaller than the `(k+1)`-th.

## Aim for

Sorting by squared distance and slicing is `O(n log n)` — a fine opening line. Then beat it: keep a max-heap of the `k` closest points so far (in Python, a min-heap of negated distances) and evict its root, the farthest, whenever something closer arrives. That's `O(n log k)` time and `O(k)` space, and it works on a stream. Mention quickselect's `O(n)` average. Compare squared distances; never take a square root. Picking the nearest remaining point `k` times is `O(n * k)` and too slow for the large test.

## Follow-ups

- The points arrive as an endless stream and anyone may ask for the current `k` closest at any moment. Which approach still works, and what does each answer cost?
- Quickselect is `O(n)` on average but `O(n^2)` at worst. What input triggers the worst case, and how does a random pivot help?
- A billion points spread across 100 machines, `k = 10`. How do you combine what the machines send back?
