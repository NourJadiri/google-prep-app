## Approach

Two small jobs: measure each row's strength, then pick the `k` weakest in the right order.

**Strength as a tuple.** The rule — fewer soldiers first, then the smaller index — is exactly how Python compares tuples: by the first item, and by the second only when the first items tie. So describe row `i` by the pair `(soldiers, i)`. "Row `a` is weaker than row `b`" is now literally `(soldiers_a, a) < (soldiers_b, b)`, and you never write a comparison yourself. The trick works for any ranking with tie-breakers: pack the rules into a tuple, most important first.

**Counting soldiers.** `sum(row)` is perfectly fine at this size. But because the `1`s all come first, the count is simply the position of the first `0`, and binary search finds it in `O(log n)`. Keep a range `[lo, hi]` that must contain the first `0`, with `hi = n` standing for "there's no `0` at all". Look at the middle cell: if it's a `1`, the first `0` is further right (`lo = mid + 1`); if it's a `0`, the first `0` is here or to the left (`hi = mid`). When `lo` meets `hi`, that's the count. `hi` must start at `n`, not `n - 1` — a row full of soldiers has no `0`, and its count is `n`.

**Picking the `k` weakest.** Sort the `m` pairs and take the indices of the first `k`: `O(m log m)`. Or use `heapq.nsmallest(k, pairs)`, which scans the pairs once while keeping a heap of the `k` best seen so far: `O(m log k)`. Both use the tuple order, so both give the same answer.

Trace Example 3, `[[1,1,1,1],[1,1,1,0],[1,1,1,1]]` with `k = 2`. The pairs are `(4, 0)`, `(3, 1)` and `(4, 2)`. The two smallest are `(3, 1)` and then `(4, 0)`, so the answer is `[1, 0]`.

How to spot it next time: a ranking with tie-break rules — "by score, then by name, then by date". Build a tuple key in priority order and let sorting or a heap do the comparing. And whenever a row or list is "all of one thing, then all of another", binary search can find the boundary.

## Complexity

Counting: `O(m log n)` with binary search, or `O(m·n)` with `sum`. Choosing: `O(m log k)` with `nsmallest`, or `O(m log m)` with a full sort. `O(m)` extra space for the pairs.

## Pitfalls

- Breaking ties the wrong way. Rows with equal soldier counts go in increasing index order.
- A binary search that can never report a full row. Starting with `hi = n - 1` makes an all-soldier row look one soldier short.
- Counting with `row.index(0)`, which crashes on a row that has no `0`.
- Returning soldier counts instead of row indices.
