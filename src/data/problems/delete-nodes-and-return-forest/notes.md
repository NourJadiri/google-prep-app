## Approach

Two things have to happen at every removed node: its surviving children become roots, and its parent forgets it. One DFS does both, with information flowing in each direction.

- **Down:** the parent passes `parent_gone`, which says whether this node has no surviving node directly above it. The root gets `True`, because nothing is above it.
- **At the node:** if it survives and `parent_gone` is true, it's the root of a new tree, so add it to the forest.
- **Into the children:** recurse into both, telling them whether *this* node is gone, and store whatever they return back into `node.left` and `node.right`.
- **Up:** return `None` if this node is removed, and the node itself otherwise. That's how a parent drops a removed child: the child pointer is simply overwritten with `None`.

Why it's correct: a node ends up in the forest exactly when it survives and nothing directly above it survives, which is the definition of a root. Every link into a removed node is replaced with `None`, and every link between two survivors is left alone. So each surviving tree is the original subtree with the removed parts cut away.

Put `to_delete` in a set first. Every node asks "am I deleted?", and that question has to cost `O(1)`.

## Complexity

`O(n + d)` time: `O(d)` to build the set, then each node is visited once with constant-time lookups. Space is `O(d)` for the set and `O(h)` for the recursion, plus the output.

## Pitfalls

- Never cutting the link from a surviving parent to a removed child. The parent's tree then still drags along the removed node and everything below it.
- Making every child of a removed node a root, even when that child is removed too (Example 2).
- Forgetting the original root. If it survives, it belongs in the answer.
- Checking `node.val in to_delete` against the list, which costs `O(d)` per node.
