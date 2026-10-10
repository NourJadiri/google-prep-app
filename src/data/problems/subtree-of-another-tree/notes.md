## Approach

**Reuse what you already have.** Same Tree answers "are these two trees identical?". A copy of `subRoot` inside `root` is a place where Same Tree, started at some node of `root`, says yes. So the job is to try Same Tree from every node of `root` — and the tidy way to visit every node is the tree recursion you've used all along.

Say what the call answers: `isSubtree(node, subRoot)` tells you whether the tree starting at `node` contains a copy of `subRoot`.

- **Base case:** an empty tree contains no copy of anything, so return `False`. (`subRoot` always has at least one node, so there's no "empty copy" to find.)
- **The step:** the copy can be in only three places — starting right here (`isSameTree(node, subRoot)`), somewhere inside the left subtree (`isSubtree(node.left, subRoot)`), or somewhere inside the right subtree. Return `True` if any of them is. Chained with `or`, the search stops at the first hit.

The two recursions do different jobs. The outer one, `isSubtree`, moves the starting point around `root`. The inner one, `isSameTree`, walks both trees in lockstep from one fixed starting point. Keep them as two separate functions — merging them into one is where the bugs come from.

Why it's correct: every node of `root` is a possible starting point, and the outer recursion reaches each of them unless it finds the answer sooner. At each one, Same Tree checks the full definition — same shape, same values, nothing extra below — because it insists that both trees run out at exactly the same places.

That last point is what Example 2 is about. A comparison that quits as soon as `subRoot` runs out would accept the subtree under `2` (where `1` has a child `3`) as a match. Same Tree says no, because the `3` faces an empty spot in `subRoot`.

Duplicates are Example 3's lesson: don't stop at the first node whose value equals `subRoot`'s root. The recursion tries every node; finding one matching value and comparing only there misses later candidates.

**Faster, if an interviewer asks.** Write each tree out in preorder, with a marker for every missing child (that fixes the shape) and a separator before every value (so `2` can't match the tail of `12`). Then `root` contains `subRoot` exactly when the second string appears inside the first. With a linear-time string search, that's `O(m + n)`.

How to spot this next time: "does one structure appear inside another?" Try every possible starting point with the equality check you already have — then, if it's too slow, look for a representation that avoids redoing work.

## Complexity

`O(m·n)` in the worst case, for `m` nodes in `root` and `n` in `subRoot`: Same Tree may start from every one of the `m` nodes and walk up to `n` nodes each time. Usually it fails within a comparison or two, so it's much faster in practice. `O(h)` extra space for the call stack, where `h` is the height of `root`.

## Pitfalls

- Letting the comparison succeed when `subRoot` runs out first. A subtree includes everything below its top node (Example 2).
- Comparing only at the first node whose value matches (Example 3).
- Serializing without separators or without markers for missing children: `2` matches inside `12`, `3` matches inside `-3`, and different shapes can produce the same string.
