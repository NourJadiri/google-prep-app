## Approach

**Look at where a path bends.** Every path in a tree has exactly one highest node: the path climbs up to it and then heads back down (either half may be empty). So the longest path overall is the best, over all nodes, of "the longest path whose highest node is this one".

Fix a node. The longest path bending there goes as far down its left side as it can and as far down its right side as it can. If the left subtree has height `L` — the number of nodes on its longest downward path — and the right subtree has height `R`, that path uses `L + R` edges: `L` steps down to the left, `R` steps down to the right.

So every node needs the heights of its two subtrees. The slow way calls a separate height function at every node; each of those calls walks a whole subtree again, which costs `O(n·h)` — about ten million steps on a 10,000-node tree that is mostly one long path.

The fast way remembers that height is itself computed from the children's heights (that's Maximum Depth). So let one recursive function do two jobs at once:

- It **returns** the height of its subtree, `1 + max(left, right)`, because that's what its parent needs.
- Along the way it **records** `left + right`, the longest path bending at this node, in a variable outside the recursion, keeping the largest value seen.

One pass visits every node once, and when it finishes, the recorded maximum is the diameter.

The idea worth keeping is why the returned value and the answer are different things. A parent can only use a path that goes *down* from its child — it can stick itself on top and pass it further up. A path that bends at a node already uses both of that node's sides, so nothing above can extend it. It's a finished candidate: write it down on the side and return the extendable thing.

Trace Example 2, `[1,2,null,3,4,5,null,null,6]`. Leaves `5` and `6` record `0` and return `1`. Node `3` sees heights `1` and `0`: it records `1` and returns `2`. Node `4` sees `0` and `1`: records `1`, returns `2`. Node `2` sees `2` and `2`: records `4`, returns `3`. The root sees `3` and `0`: records `3`. The best recorded value is `4`.

A Python detail: the recorded maximum lives in the outer function, so the inner function needs `nonlocal best` before assigning to it (an attribute on `self` works too).

How to spot this next time: the answer is the best of something that can sit anywhere in the tree — not necessarily at the root. Compute "the best that bends here" at every node, and return to the parent the quantity it needs to keep going, which is usually different.

## Complexity

`O(n)` time: one visit per node, constant work each. `O(h)` extra space for the call stack, where `h` is the height.

## Pitfalls

- Assuming the longest path goes through the root. Example 2 is the counterexample.
- Counting nodes instead of edges: `left + right + 1` is the number of nodes on the path, one too many.
- Returning the recorded best from the helper instead of the height. The parent needs a downward path it can extend, not a finished bent one.
- Calling a separate height function from every node. The answers are right, but it's `O(n·h)`, and the largest test is built to make that too slow.
