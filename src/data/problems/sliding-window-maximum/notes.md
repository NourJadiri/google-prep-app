## Approach

Use a **monotonic deque**: a deque of indices into `nums` with two properties.

1. Their values strictly decrease from front to back.
2. They all lie inside the current window.

The front is then the window's maximum. Every window element missing from the deque was popped because a newer element at least as large arrived, and that element, or one that later beat it, is still in the deque. So nothing missing can be the maximum, and among the indices still present the front holds the largest value.

For each new index `i` with value `x`:

- **Expire.** If the front index is `<= i - k`, it has just left the window, so pop it. At most one index leaves per step.
- **Dominate.** While the value at the back is `<= x`, pop it. Those elements are older than `x` and no bigger. Every future window that contains them also contains `x`, so they can never be the maximum again.
- **Push** `i` at the back.
- Once `i >= k - 1` the window is full, so record `nums[dq[0]]`.

## Complexity

`O(n)` time. Every index is pushed once and popped at most once, either from the back by domination or from the front by expiry. So the total deque work is linear, even though a single step's `while` loop can pop many indices. Extra space is `O(k)` for the deque, plus the `n - k + 1` outputs.

For comparison: a max-heap of `(value, index)` pairs with lazy deletion (keep popping the top while its index is outside the window) is `O(n log n)`. Recomputing the maximum only when the old maximum leaves looks clever, but it's still `O(n k)` on decreasing input, where the maximum leaves at every step. The large tests include exactly that input.

## Pitfalls

- Expiring one step late. The front leaves when its index is `<= i - k`, not `< i - k`. With the late check, every window is effectively `k + 1` wide.
- Storing values instead of indices. Then you can't tell whether the front has left the window, and comparing values breaks down with duplicates. Indices sidestep the question.
- Emitting a value before the first window is full, or skipping the last window. There are exactly `n - k + 1` outputs.
