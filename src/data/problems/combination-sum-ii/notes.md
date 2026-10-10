## Approach

Sort the candidates, then build combinations in index order: the subsets pattern with a running total.

```
backtrack(start, remaining):
    if remaining == 0:
        record path[:]
        return
    for i in range(start, len(c)):
        if i > start and c[i] == c[i - 1]: continue   # prune: duplicate choice
        if c[i] > remaining: break                     # prune: too big, and so is the rest
        path.append(c[i])                              # choose
        backtrack(i + 1, remaining - c[i])             # explore: each entry once
        path.pop()                                     # un-choose
```

Recursing with `i + 1` is what makes each *entry* usable once. The two prunings are the interesting part.

**The duplicate skip.** One call of `backtrack` decides *which value goes into the next slot*. If `c[i]` equals `c[i - 1]`, and `c[i - 1]` was already tried in this same slot, then choosing `c[i]` here would rebuild exactly the combinations already found. So skip it, but only when `i > start`. The first copy at each depth is always allowed, and the second copy stays reachable *one level deeper*, as the choice for the next slot; that is how `[1,1,3,3]` gets built. Writing `i > 0` instead of `i > start` blocks that too, and loses every combination that repeats a value.

**The size break.** The candidates are sorted and positive, so once `c[i] > remaining`, every later candidate is too big as well: `break`, not `continue`.

Why not generate everything and de-duplicate with a set? Because then the search, not the answer, explodes. A hundred `1`s with `target = 30` have one answer, but `C(100, 30)` (about `3 · 10^25`) ways to pick its positions. The skip collapses all of them into a single path.

Correctness in one line: with the list sorted, every distinct combination has exactly one representative path, the one that always uses the *leftmost* unused copy of each value, and the skip rule permits exactly those paths.

## Complexity

Exponential in the worst case, as any enumeration can be, plus `O(n log n)` for the sort. What the skip guarantees is that no two branches ever build the same combination, so the search is bounded by the number of distinct partial combinations whose sum stays within `target`, not by the number of ways to choose positions. Each recorded answer costs `O(target)` to copy (every value is at least `1`). Extra space is `O(target)` for the path and the recursion.

## Pitfalls

- `i > 0` instead of `i > start`: drops every combination that uses a repeated value more than once.
- De-duplicating at the end instead of during the search: right answers, exponential time on inputs with many repeats.
- Skipping duplicates without sorting first: equal values must sit next to each other for the check to see them.
