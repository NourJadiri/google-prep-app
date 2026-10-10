## Approach

**Flip the question.** Finding the best cut directly is hard, but checking a proposed cost is easy. Given a cap `c`, can `nums` be cut into at most `k` pieces whose sums are all `<= c`?

**The greedy check.** Walk left to right, adding each number to the current piece. When the next number would push the piece over `c`, close the piece and start a new one with that number. Count the pieces.

Packing each piece as full as possible is optimal. Compare the greedy with any valid cut. The greedy's `j`-th piece always ends at or after the other cut's `j`-th piece: it starts no later, and the stretch from its start to the end of the other cut's piece is part of that piece. Since the numbers are non-negative, that stretch fits under `c` too. So the greedy never falls behind, and it never needs more pieces. The check needs `c >= max(nums)`; below that, some number doesn't fit in any piece.

**At most `k` pieces is as good as exactly `k`.** If the greedy uses fewer than `k` pieces, split some pieces further. There are enough elements because `k <= n`, and part of a piece never sums to more than the whole piece, because the numbers are non-negative. So "feasible with at most `k`" means "feasible with exactly `k`".

**Binary search the cap.** Feasibility is monotone: if cap `c` works, every larger cap works too. The answer lies between `max(nums)` (some piece holds the largest number) and `sum(nums)` (one piece holds everything). Binary search for the smallest cap that works, with one `O(n)` greedy pass per probe.

**The DP alternative.** Let `best[j][i]` be the smallest possible largest-piece sum when the first `i` numbers are cut into `j` pieces. Then `best[j][i] = min over m of max(best[j-1][m], sum(nums[m:i]))`. It's correct and worth sketching, but it's `O(k n^2)`. With `n = 1000` and `k = 500` that's hundreds of millions of steps, far too slow in Python. The large tests include long runs of zeros, which also defeat the usual early-exit pruning of the inner loop.

## Complexity

`O(n log S)` time with `S = sum(nums)`. `S` is at most `10^9`, so that's about 30 probes of `O(n)` each. `O(1)` extra space.

## Pitfalls

- Starting the search below `max(nums)`, at `0` or `1`. The greedy then drops an oversized number into a piece of its own, reports success for a cap no cut can meet, and the search returns something smaller than the largest element.
- Counting pieces from `0` instead of `1`. The last piece, still open when the loop ends, counts too.
- Testing `== k` instead of `<= k`. Once `k` or fewer pieces fit, exactly `k` fit as well, and an `== k` test breaks the monotonicity the binary search relies on.
