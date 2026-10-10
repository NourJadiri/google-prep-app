## Approach

The direct approach compares each element with the `k` elements after it: `O(n * k)`, which at the maximum size is billions of comparisons. Instead, walk the list once and let a dictionary remember the past.

**The pattern: a hash map of where you last saw each value.** The question at each index `i` is "have I seen `nums[i]` recently?" A dictionary answers "have I seen it, and where?" in `O(1)`. And of all the earlier copies of a value, only the most recent one matters: it's the closest to `i`, and it will be the closest to every index after `i` as well.

- `last` maps each value to the latest index it appeared at.
- At index `i`, with value `x`: if `x` is in `last` and `i - last[x] <= k`, you've found a close pair, so return `True`.
- Either way, set `last[x] = i`. The new copy replaces the old one, because it's closer to everything still to come.

Tracing `[5,8,3,8,1]` with `k = 2`:

```
i 0: 5 is new                       last {5: 0}
i 1: 8 is new                       last {5: 0, 8: 1}
i 2: 3 is new                       last {5: 0, 8: 1, 3: 2}
i 3: 8 was at 1, and 3 - 1 = 2 <= 2  -> True
```

**Why overwriting is right.** If a value appears at indices `a < b < c`, then `c - b < c - a`. The pair `(b, c)` is always closer than `(a, c)`, so once `b` has been seen, `a` can be forgotten.

**A sliding-window version.** Instead of a dictionary of every value, keep a set of only the last `k` values. At each `i`, if `nums[i]` is already in the set, return `True`. Otherwise add it, and if `i >= k`, remove `nums[i - k]`, which is now too far from everything still to come. The set never holds more than `k` values, so the memory is `O(min(n, k))`, which answers the first follow-up.

**Spotting it next time.** "Two equal values within distance `k`", "a repeat inside a window": ask "have I seen this recently?" and answer with a hash map of last positions, or a set that slides along as a window. Relatives: Two Sum (a map of what you've seen), Contains Duplicate (a set), and Longest Substring Without Repeating Characters (a window plus a set).

## Complexity

`O(n)` time: one pass, with `O(1)` average per dictionary operation. `O(n)` space for the dictionary, or `O(min(n, k))` for the window set.

## Pitfalls

- Remembering only where each value *first* appeared. In `[7,1,2,7,4,7]` with `k = 2`, the last two `7`s are two apart, but both are too far from the first one.
- Using `<` instead of `<=`: copies exactly `k` apart count.
- `k = 0`: no pair can qualify, because the two indices must be different (Example 3).
