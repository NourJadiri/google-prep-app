## Approach

**Binary search on the answer.** There's no list in this problem, but there is a sorted line of yes/no answers. For each candidate `k = 0, 1, 2, ...`, ask: *is `k * k <= x`?* Squares only get bigger, so the answers go `yes, yes, ..., yes, no, no, ...`, and the answer to the problem is the last yes. Finding where a line of yes/no answers switches is exactly what binary search does. First Bad Version found the first yes, and here we want the last one.

Which values could the answer be? It's always somewhere in `[0, x]`. `0 * 0 <= x` is always true, and for `x >= 1` the square root of `x` is never bigger than `x`. Search that range with the same loop as before, using these promises:

- Every `k` **before `lo`** fits, meaning `k * k <= x`.
- Every `k` **after `hi`** doesn't fit.

While `lo <= hi`, take `mid`. If `mid * mid <= x`, then `mid` and everything smaller fit, so set `lo = mid + 1`. Otherwise `mid` and everything bigger don't fit, so set `hi = mid - 1`.

The loop ends with `lo == hi + 1`. Everything up to `hi` fits and everything from `lo` on doesn't, so the answer, the last `k` that fits, is `hi`.

Here's a trace for `x = 50`:

- `lo = 0`, `hi = 50`, `mid = 25`. `625 > 50`, so `hi = 24`.
- `lo = 0`, `hi = 24`, `mid = 12`. `144 > 50`, so `hi = 11`.
- `lo = 0`, `hi = 11`, `mid = 5`. `25 <= 50`, so `lo = 6`.
- `lo = 6`, `hi = 11`, `mid = 8`. `64 > 50`, so `hi = 7`.
- `lo = 6`, `hi = 7`, `mid = 6`. `36 <= 50`, so `lo = 7`.
- `lo = 7`, `hi = 7`, `mid = 7`. `49 <= 50`, so `lo = 8`.
- Now `lo` is bigger than `hi`, so return `hi`, which is `7`.

**First Bad Version compared with this one.** The two problems use the same loop. The only difference is which side of the boundary you want. First Bad Version wanted the first yes, so it returned `lo`. Here we want the last yes, the last `k` that fits, which sits just before the crossing point, so we return `hi`. If you're ever unsure which one to return, trace a tiny case like `x = 8` by hand and see which pointer lands on the right number.

**Spotting it next time.** When a problem asks for "the largest value such that ..." or "the smallest value such that ...", and checking a single candidate is easy, ask whether the yes/no answers are monotonic. If they are, binary search over the possible *answers* instead of over an array. Finding the smallest ship that can deliver everything within `D` days, or the slowest eating speed that still finishes on time, works exactly this way.

## Complexity

`O(log x)` time: the range `[0, x]` halves at every step, so even `x = 2^31 - 1` takes about 31 steps. `O(1)` extra space.

## Pitfalls

- A starting range that misses the answer. Narrowing it to `[0, x // 2]` is a popular shortcut, and it works for every `x >= 2`. But for `x = 1` the answer is `1`, which isn't in `[0, 0]`.
- Returning `lo` instead of `hi`. After the loop, `lo` is the first `k` that's too big, which is one more than the answer.
- Reaching for floating point, as in `int(x ** 0.5)`. It isn't allowed here, and with numbers far bigger than this problem's limit, floating-point rounding can make it off by one.
