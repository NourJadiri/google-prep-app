## Approach

**The pattern: DP over numbers.** You need an answer for *every* number from `0` to `n`, and each number's bits look a lot like the bits of some smaller number. That's the DP signal again: if `ans[i]` can be written in terms of `ans` at a smaller index, one left-to-right pass fills the whole list, because the smaller answer is always ready by the time you need it.

**Finding the smaller number.** Shifting right by one, `i >> 1`, deletes the last binary digit of `i` (it's the same as `i // 2`). For example, `13` is `1101`, and `13 >> 1 = 6` is `110`. The two numbers share every bit except the one that fell off the end — and that bit is `i & 1`: 1 when `i` is odd, 0 when it's even. So:

- **State:** `ans[i]` = the number of 1 bits in `i`.
- **Recurrence:** `ans[i] = ans[i >> 1] + (i & 1)`.
- **Base case:** `ans[0] = 0`.

For every `i >= 1`, `i >> 1` is smaller than `i`, so walking `i` upward from 1 always finds it already filled in. Tracing up to 6: `ans[1] = ans[0] + 1 = 1`, `ans[2] = ans[1] + 0 = 1`, `ans[3] = ans[1] + 1 = 2`, `ans[4] = ans[2] + 0 = 1`, `ans[5] = ans[2] + 1 = 2`, `ans[6] = ans[3] + 0 = 2`.

**Other smaller numbers work too.** `i & (i - 1)` clears the lowest 1 bit of `i` (subtracting 1 turns that lowest 1 into a 0 and the 0s after it into 1s, and the `&` wipes them all out), so `ans[i] = ans[i & (i - 1)] + 1`. Or take the highest power of two `p <= i`: `i - p` drops the leading 1, so `ans[i] = ans[i - p] + 1`. Same pattern, different choice of smaller number.

**Why it's correct.** Each recurrence relates `i` to a smaller number whose binary form differs in a known way — one bit removed — and adds back exactly the 1s that were removed. The base case `ans[0] = 0` is right, and since every entry depends only on an earlier one, filling the list in increasing order computes each entry from a value that's already correct.

**Spotting it next time.** "Return an answer for every value from `0` to `n`" is a strong hint that answers can be built from earlier answers. Ask yourself: what simple operation turns `i` into a smaller number I've already solved, and how does the answer change along the way?

## Complexity

`O(n)` time: constant work per number. `O(1)` extra space beyond the `n + 1` answers themselves. (Counting each number's bits separately is `O(n log n)`, since a number up to `n` has about `log2(n)` bits.)

## Pitfalls

- Operator precedence. In Python `+` binds tighter than `&`, so `ans[i >> 1] + i & 1` means `(ans[i >> 1] + i) & 1`. Write `ans[i >> 1] + (i & 1)`.
- Returning `n` entries instead of `n + 1`: the list covers `0` through `n` inclusive, so `n = 0` still needs `[0]`.
- In the power-of-two version, moving `p` up to the next power of two *after* using it: every power of two then gets the wrong count.
