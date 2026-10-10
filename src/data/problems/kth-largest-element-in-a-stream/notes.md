## Approach

**Keep only what can still matter.** Say `k = 3` and the scores so far are `12, 9, 8, 5, 1`. The answer is `8`. Could `5` or `1` ever be the answer again? No — three scores at least as large as them have already arrived, and future scores can only add competition. So at any moment only the `k` largest scores matter, and the answer is the **smallest** of those `k`.

That points straight at the data structure: a collection of `k` values where the smallest is always visible and cheap to swap out. That's a **min-heap of size `k`**. Its top is the smallest of the top `k` — which is the `k`-th largest overall.

- Constructor: heapify `nums`, then pop the smallest until only `k` values remain. The popped values can never matter again.
- `add(val)`: push `val`. If the heap now holds more than `k` values, pop the smallest. Return the top.

Why a *min*-heap when the problem says "largest"? Because the operation you keep repeating is "throw away the smallest candidate", and the answer is the smallest candidate. The heap guards the bottom edge of the top `k`, and that edge is its minimum.

One edge case: `k` may be one more than `len(nums)`. The heap then starts with only `k - 1` values; the first `add` pushes without popping, and the heap reaches size `k` exactly when the first answer is due. "Push, then pop if too big" handles that with no special code. `heapq.heappushpop`, which always pops, would leave the heap one value short forever.

Trace Example 1, `k = 2` and `nums = [9,1,5]`. The heap starts as `{1, 5, 9}`; trimming pops `1`, leaving `{5, 9}`. `add(3)`: push to get `{3, 5, 9}`, pop `3`, top `5`. `add(12)`: `{5, 9, 12}`, pop `5`, top `9`. `add(8)`: `{8, 9, 12}`, pop `8`, top `9`. `add(10)`: `{9, 10, 12}`, pop `9`, top `10`.

How to spot it next time: "the `k`-th largest", "the top `k`", "the `k`-th smallest" — in a stream, or in a collection too big to sort. Keep a heap of size `k`: a min-heap when you want the largest values, a max-heap (negated values) when you want the smallest.

## Complexity

`add`: `O(log k)` — one push and at most one pop on a heap of at most `k + 1` values. Constructor: `O(n log n)` as written (heapify is `O(n)`, then up to `n` pops); building it with `heapq.nlargest(k, nums)` makes it `O(n log k)`. `O(k)` memory after construction.

## Pitfalls

- Not trimming in the constructor. If `nums` has more than `k` values, the heap stays too big for good, and its top is the wrong rank.
- Using `heappushpop`, or "replace the top if the new value is bigger", while the heap holds fewer than `k` values — the `k = len(nums) + 1` case.
- Keeping every score and sorting, or popping `k` times, on every `add`. That's `O(n log n)` or `O(k log n)` per call, and the big tests notice.
