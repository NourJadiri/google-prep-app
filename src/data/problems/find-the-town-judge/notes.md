## Approach

**The pattern: count degrees instead of searching.** Not every graph problem needs a BFS or DFS. Treat each pair `[a, b]` as an arrow `a → b`. Then both rules are statements about the arrows touching a single resident:

- "trusts nobody" means **no arrows going out** — an *out-degree* of 0;
- "every other resident trusts them" means **an arrow coming in from each of the other `n - 1` residents** — an *in-degree* of `n - 1`.

So you never need to know *who* trusts whom, only *how many*. Make two arrays of counters of size `n + 1` (labels start at 1, so index 0 simply goes unused). Walk `trust` once, adding 1 to `trusts[a]` and to `trusted_by[b]`. Then walk the residents and return the one with `trusted_by == n - 1` and `trusts == 0`.

Why does an in-degree of `n - 1` mean *everyone* trusts them, rather than just "lots of people"? Because no pair repeats and nobody trusts themselves, `n - 1` incoming arrows must come from `n - 1` different residents — which is all of the others.

**One counter is enough.** Keep `score[p] = (arrows in) - (arrows out)`. In-degree is at most `n - 1` and out-degree is at least 0, so `score[p]` can only reach `n - 1` when the in-degree is `n - 1` **and** the out-degree is 0 — exactly the judge's signature. It's a neat squeeze, but the two-array version says what it means and is just as fast.

**The edge cases look after themselves.** With `n = 1` and no trust at all, resident 1 needs `n - 1 = 0` arrows in and has exactly that: they're the judge. With `n = 2` and an empty list, nobody has the one incoming arrow required: `-1`. No special cases needed — as long as you don't add an early `if not trust: return -1`.

**Why it's correct.** The two rules say exactly "out-degree 0" and "in-degree `n - 1`", and the counters hold every resident's true degrees. At most one resident can pass — if two did, each would have to trust the other, breaking "trusts nobody" — so returning the first one found is safe.

**Spotting it next time.** When the question is about *how many* links each item has — "trusted by everyone", "follows nobody", "the most-followed account", "the course with no prerequisites" — count in-degrees and out-degrees in one pass. Degree counting is also the first step of topological sort, which you'll meet later.

## Complexity

`O(n + T)` time: one pass over the `T` trust pairs and one over the `n` residents. `O(n)` extra space for the counters.

## Pitfalls

- Checking only that everyone trusts the candidate, and forgetting the judge must trust nobody: `[[1,2],[3,2],[2,1]]` has no judge.
- Returning `-1` straight away when `trust` is empty — a town of one resident has a judge.
- Arrays of size `n` indexed directly by label: resident `n` falls off the end. Size them `n + 1`, or subtract 1 from every label.
