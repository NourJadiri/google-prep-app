## Approach

The direct approach adds up all `k` elements of every window: `O(k)` per window, `O(n * k)` overall, which at the maximum size is billions of additions. But neighbouring windows overlap almost completely.

**The pattern: a fixed-size sliding window.** When you need something about every run of `k` consecutive elements, don't rebuild each run from scratch. Slide it. Moving the window one step to the right adds exactly one element on the right and drops exactly one on the left; the other `k - 1` stay. So keep a running sum:

- Add up the first `k` elements. That's the first window.
- For each `i` from `k` to the end, `nums[i]` enters and `nums[i - k]` leaves: `window += nums[i] - nums[i - k]`.
- Keep the largest window sum you see, and divide by `k` once at the end.

Tracing Example 1, `[4,-1,7,2,-5,6]` with `k = 2`:

```
window    enters  leaves   sum   best
[4,-1]                       3      3
[-1,7]       7       4       6      6
[7,2]        2      -1       9      9
[2,-5]      -5       7      -3      9
[-5,6]       6       2       1      9    -> 9 / 2 = 4.5
```

**Why compare sums instead of averages.** Every window has the same length `k`, so the window with the biggest sum also has the biggest average. Comparing whole-number sums keeps everything exact, and the single division at the end is the only place a float appears.

**Spotting it next time.** "Contiguous", "subarray of length `k`", "every window", "any `k` consecutive days": a sliding window. With a fixed size it's add one, drop one, exactly as here. Many later problems use a window whose size changes: the right edge grows, and the left edge shrinks whenever a condition breaks (Longest Substring Without Repeating Characters, Minimum Size Subarray Sum). This problem is the gentle first step.

## Complexity

`O(n)` time: each element enters the window once and leaves at most once. `O(1)` extra space.

## Pitfalls

- Starting `best` at `0`. If every window's sum is negative (Example 2), nothing beats `0` and you return `0.0`. Start from the first window's sum instead.
- Dropping the wrong element: the one leaving is `nums[i - k]`, not `nums[i - k + 1]`.
- Integer division: `//` rounds down, so `9 // 2` is `4`, not `4.5`. Use `/`.
