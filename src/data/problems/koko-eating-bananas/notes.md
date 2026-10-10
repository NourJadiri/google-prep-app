## Approach

This is **binary search on the answer**. Fix a speed `k`. A pile of `p` bananas takes `ceil(p / k)` hours: some full hours eating `k` at a time, plus one more hour for any remainder. So the total time at speed `k` is

`hours(k) = sum of ceil(p / k) over all piles`

`hours(k)` never goes up as `k` grows, because each term can only shrink or stay the same. So if speed `k` is fast enough, every faster speed is too, and the fast-enough speeds form one unbroken range `[answer, …)`. That monotonicity is what makes binary search legal here. You aren't searching a sorted array. You're searching for the first `k` where the yes/no question "is `hours(k) <= h`?" flips from no to yes.

The bounds: speed `1` is the slowest possible. Speed `max(piles)` always works, since every pile then takes exactly one hour and `len(piles) <= h`. Search `[1, max(piles)]`:

- if `hours(mid) <= h`, `mid` works, so the answer is `mid` or slower: `hi = mid`;
- otherwise `mid` is too slow: `lo = mid + 1`.

When `lo == hi`, that's the slowest speed that works.

Compute `ceil(p / k)` in integers: `(p + k - 1) // k`, or `-(-p // k)`. Floats happen to be exact enough at these sizes, but integer arithmetic removes the doubt, and in languages with fixed-width integers you'd also watch the sum for overflow.

## Complexity

`O(n log m)` time with `m = max(piles)`: about 30 probes when `m = 10^9`, each an `O(n)` sum. `O(1)` extra space.

## Pitfalls

- Floor division. `p // k` undercounts every pile that doesn't divide evenly: a pile of `7` at speed `3` takes 3 hours, not 2.
- Starting the search at `min(piles)`. With lots of time the answer can be below every pile: `[3,100]` with `h = 100` needs only speed `2`.
- `hi = mid - 1` after a speed that works. `mid` might be the answer, so keep it in the range.
- Trying speeds one at a time from `1` upward (or from `max(piles)` downward). That's `O(n · m)` in the worst case, and the large tests are built to make each direction time out.
