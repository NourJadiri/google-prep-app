## Approach

The direct approach adds up both sides again at every index: `O(n)` work per index, `O(n^2)` overall. The trick is to never add up the same numbers twice.

**The pattern: running sums (prefix sums).** Any question about "the sum of everything before here" can be answered on the fly: keep a running total as you sweep from left to right, adding each element once you're done with its index. The sum of everything *after* here then comes for free from the grand total, because the three pieces always add up:

`left + nums[i] + right == total`, so `right == total - left - nums[i]`.

So add up the whole list once to get `total`. Then sweep with `left = 0`. At each index, check whether `left == total - left - nums[i]`; if so, return `i`. You're sweeping from the left, so the first hit is the leftmost pivot. Otherwise add `nums[i]` to `left` and move on. If the sweep ends without a hit, return `-1`.

Tracing `[2,3,0,0,5]`, where `total = 10`:

```
i 0:  left 0,  right 10 - 0 - 2 = 8    no
i 1:  left 2,  right 10 - 2 - 3 = 5    no
i 2:  left 5,  right 10 - 5 - 0 = 5    yes -> return 2
```

**Why the order matters.** `nums[i]` sits on neither side. So the check at index `i` has to happen while `left` still covers only `nums[:i]`, and `nums[i]` joins `left` afterwards, ready for index `i + 1`.

**Spotting it next time.** "The sum of a range", "everything to the left", "a balance point", or the same kind of range sum asked over and over: running sums turn each `O(n)` re-add into `O(1)`. With a running product instead of a sum, the same idea solves Product of Array Except Self, and storing the running sums in a dictionary solves Subarray Sum Equals K.

## Complexity

`O(n)` time: one pass for the total and one for the sweep. `O(1)` extra space.

## Pitfalls

- Adding `nums[i]` to `left` *before* checking. The candidate's own value then counts on the left side, and in Example 1 the check wrongly fires at index `1`.
- Skipping the first or last index because "a pivot needs elements on both sides". An empty side sums to `0`, so the ends can be pivots (Example 2), and a one-element list always has pivot `0`.
- Stopping early once the left sum "gets past" the right sum. With negative numbers, the left sum can go down as well as up.
