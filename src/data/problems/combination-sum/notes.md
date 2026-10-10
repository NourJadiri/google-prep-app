## Approach

A combination is a multiset, so the trick is to generate each multiset in exactly **one** order, non-decreasing, and never think about duplicates again.

```
backtrack(start, remaining):
    if remaining == 0:
        record path[:]
        return
    for i in range(start, len(c)):           # c is sorted
        if c[i] > remaining: break            # prune: this one and all later ones are too big
        path.append(c[i])                     # choose
        backtrack(i, remaining - c[i])        # explore from i, so c[i] can repeat
        path.pop()                            # un-choose
```

The `start` index enforces the order. After choosing `c[i]`, the path may continue with `c[i]` again (unlimited reuse) or with anything after it, but never with anything before it. So `[2,2,3]` can be built and `[3,2,2]` can't, and they are the same combination. Every multiset has exactly one non-decreasing arrangement, so each answer is produced exactly once.

Sorting earns the second pruning: `break` at the first candidate larger than `remaining`, since every later one is larger still. Recursing with `i` rather than `i + 1` is the only difference from "each candidate at most once".

Why the order matters so much: without `start`, every slot may take any candidate, and the search builds every *ordering* of every combination. With `candidates = [2,3,4,5]` and `target = 40` there are 145 combinations but about 9 million orderings; de-duplicating them afterwards with a set gives the right answer, far too slowly.

## Complexity

Exponential in general, as enumeration often is. The depth is at most `target / min(candidates)`, at most 20 here. Thanks to the order constraint, the search tree has one node per non-decreasing partial combination that still fits under the target, instead of one per ordering; on the 145-combination input above that is 1,747 nodes against 26 million. Each answer costs `O(target / min)` to copy. Extra space is `O(target / min)` for the path and the recursion.

## Pitfalls

- Looping from `0` instead of `start`: each combination comes back once per ordering.
- `break` without sorting first: the first oversized candidate hides every smaller one listed after it.
- Recursing with `i + 1`: that's the use-each-once rule of Combination Sum II, and it misses `[2,2,2,3]`.
