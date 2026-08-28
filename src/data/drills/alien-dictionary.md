# Alien Dictionary — in-app drill

**Day 13 · Order Junction · Hard · topological sort**
Stands in for LeetCode 269 (premium). Original statement written for this app — same task, own words and examples.

## The task

A recovered shipping ledger lists product codes that were kept **sorted**, but under a collation whose letter order has been lost. The codes use lowercase letters. From `words`, the list in its original sorted order, reconstruct a letter ordering consistent with it.

Return the alphabet as a string. If several orderings fit, any one of them is accepted. If **no** ordering can explain the list, return `""`.

## Examples

**Example 1**

```
words = ["ta", "tb", "ab", "ac"]   -> "tabc"
```

`ta < tb` says `a < b`. `tb < ab` says `t < a`. `ab < ac` says `b < c`. Chain them: `t, a, b, c`.

**Example 2**

```
words = ["z", "x", "zy"]           -> ""
```

`z < x` from the first pair, but `x < zy` says `x < z`. That's a cycle — no alphabet satisfies both.

**Example 3**

```
words = ["ab", "a"]                -> ""
```

A word may never sort after its own extension. This is the trap case: it produces **no** edge, yet the answer is still `""`.

**Example 4**

```
words = ["qq", "qq"]               -> "q"
```

Equal neighbours are fine and teach nothing. Letters with no constraints still appear in the output — exactly once.

## Constraints

- `1 <= words.length <= 100`, `1 <= words[i].length <= 100`
- Output must contain every letter that occurs anywhere in `words`, each once.

## Aim for

`O(total characters)` overall. Each **adjacent pair** contributes at most one edge: the first position where the two words differ. Then it's Kahn's, verbatim from this morning's ritual — indegrees, zero-queue, pop-decrement — and the leftover-node rule answers the cycle case: if the output is shorter than the letter set, return `""`. State all three failure/ambiguity behaviours before coding; that's most of the interview.

## Interviewer follow-ups to be ready for

- Why only adjacent pairs? What do non-adjacent comparisons add? (Nothing — transitivity. Say why.)
- How would you return the **lexicographically smallest** valid alphabet? (Priority queue where the zero-queue was.)
- How do you surface *which* words contradict, for a real error message?

---
*Paste everything above into Claude and ask it to play interviewer — have it hold the solution back until you've talked through an approach and a complexity out loud.*
