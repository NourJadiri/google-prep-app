## Approach

Turn weights into lengths. Put the weights end to end on a number line: index `0` owns the integers `1..w[0]`, index `1` owns the next `w[1]` integers, and so on up to `sum(w)`. Roll one integer uniformly from `1..sum(w)`; the index that owns it is your pick. Index `i` owns exactly `w[i]` of the `sum(w)` equally likely rolls, so it comes back with probability `w[i] / sum(w)` — the weighting is exact, not approximate.

The block boundaries are the running totals `prefix[i] = w[0] + … + w[i]`, which only increase. Index `i` owns the rolls `prefix[i-1] + 1 .. prefix[i]`, so the owner of a roll `t` is the **first** index whose running total is `>= t` — `bisect_left(prefix, t)`. Build `prefix` once in the constructor; each pick is one roll and one binary search.

The boundaries have to agree. With rolls in `1..total`, use `bisect_left` (first total `>= t`). With rolls in `0..total-1`, the owner is the first total `> t`, which is `bisect_right`. Mixing them is off by one: rolling `0..total-1` with `bisect_left` gives the first index one roll too many and the last index one too few, while rolling `1..total` with `bisect_right` takes a roll from the first index and sometimes returns `len(w)`.

## Complexity

Constructor: `O(n)` time and space for the running totals. `pickIndex`: `O(log n)` for the binary search plus `O(1)` for the roll.

## Pitfalls

- Roll range and search disagreeing by one (above). With `w = [1, 1]` the error is a 2:1 split or an index that never comes up — always try your code on tiny weights.
- Scanning the running totals linearly: correct, but `O(n)` per pick — `10^8` steps at the limits.
- `random.choices(range(n), weights=w)` rebuilds the running totals on every call, which is also `O(n)` per pick. Passing `cum_weights=prefix` fixes that.
- Rolling a float works too: `random.random() * total` lands in `[0, total)`, so its owner is the first running total strictly greater than it — `bisect_right`.
