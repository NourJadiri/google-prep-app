## Approach

This is the tree template from Maximum Depth again — handle the empty tree, let recursion deal with the children, finish the job at the node — except that a call now hands back a tree instead of a number.

Say in one sentence what a call does: `invertTree(node)` mirrors the tree that starts at `node` and returns that tree's root.

- **Base case.** The mirror image of an empty tree is an empty tree, so for `None` return `None`.
- **The step at one node.** The mirror image of a tree is the same root, with the mirrored *right* subtree on its left and the mirrored *left* subtree on its right. So mirror both subtrees — trust the recursion to do that correctly — attach them on opposite sides, and return the node.

Why does that produce the whole mirror image? Every node in the tree runs that same step once, so every node's children get swapped exactly once, and the swaps at deeper nodes are already done by the time a call returns. The empty tree is trivially its own mirror, and the calls always bottom out there.

The only real trap is the order of the assignments. Written as two lines, `root.left = invert(root.right)` followed by `root.right = invert(root.left)`, the second line reads `root.left` after it has already been replaced — the original left subtree is gone, and the right one gets used twice. Python's tuple assignment, `root.left, root.right = invert(root.right), invert(root.left)`, evaluates the entire right-hand side before assigning anything, so both calls see the original children. In a language without that, save one child in a temporary variable first.

Swap first and then recurse, or recurse first and then swap? Both work. Each node's two children are swapped once either way; you're only choosing when it happens. The same reasoning gives an iterative version: put the root in a queue (or on a stack), and for every node you take out, swap its children and add them to the queue.

How to spot this shape next time: "do something to every node of a tree" — mirror it, add one to every value, prune it. Do the work at the node, hand the children to the recursion, and return the (possibly new) root so the parent can reattach it.

## Complexity

`O(n)` time: every node is visited once. `O(h)` extra space for the call stack, where `h` is the tree's height. No new nodes are created — the tree is rearranged in place.

## Pitfalls

- Overwriting `root.left` before reading it, as above. One subtree ends up hanging on both sides and the other disappears.
- Forgetting `return root`. The swaps happen, but the caller receives `None`, and so does the test.
- Swapping values instead of subtrees. Mirroring moves whole subtrees, gaps included: a lone left child has to become a lone right child, which no amount of value-swapping achieves.
