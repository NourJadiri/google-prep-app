## Approach

The idea that makes tree problems manageable: **a tree is a root with two smaller trees hanging under it.** The left child is the root of a whole tree of its own (the left subtree), and so is the right child. So a function that solves the problem for "a tree" can solve it by calling itself on those two smaller trees.

Before writing any code, say in one sentence what a call returns. Here: `maxDepth(node)` returns the depth of the tree that starts at `node`. Then answer two questions.

- **What's the answer for an empty tree?** When `node` is `None` there are no nodes, so the depth is `0`. This is the base case: the place where the calls stop.
- **If you already had the answers for both subtrees, what would yours be?** The longest path down from `node` is `node` itself followed by the longest path in whichever subtree is deeper: `1 + max(left depth, right depth)`.

The second question is where most people get stuck: "how do I know `maxDepth(node.left)` gives the right answer?" Trust it. It's the same function on a smaller tree, the same two rules handle that tree, and the calls always bottom out at empty trees. You only ever write the step for one node — that leap of faith is the heart of recursion.

Watch the answers travel up Example 1, `[8,3,10,null,6,null,14,4]`. The leaves `4` and `14` each have two empty children, so each returns `1 + max(0, 0) = 1`. Node `6` returns `1 + max(1, 0) = 2`; node `3` returns `1 + max(0, 2) = 3`; node `10` returns `1 + max(0, 1) = 2`; and the root returns `1 + max(3, 2) = 4`.

Why make the empty tree the base case, rather than the leaf? Because `0` for "no tree" makes the one formula work everywhere: a leaf is just a node whose two subtrees are empty, and a node with a single child is handled too — its missing side counts as `0`.

Almost every tree problem in this part of the track has this shape — handle the empty tree, ask both children, combine the answers at the node:

```
def solve(node):
    if node is None:
        return ...          # the answer for an empty tree
    left = solve(node.left)
    right = solve(node.right)
    return ...              # combine left, right and node.val
```

How to spot it next time: the question is about a whole tree, and you can say how the answer for a tree follows from the answers for its two subtrees. That's this template.

Without recursion, count levels instead: put the root in a queue, then repeatedly take out one full row of nodes and put in all their children. The number of rows you process is the depth.

## Complexity

`O(n)` time: each node is visited once and does constant work. `O(h)` extra space for the call stack, where `h` is the height of the tree — about `log n` for a bushy tree, but up to `n` for a tree that is one long path.

## Pitfalls

- Counting edges instead of nodes. Here a single node has depth `1`; returning `-1` for an empty tree measures edges and is off by one on every input.
- Making "is it a leaf?" the only base case. A node with one child still calls into its missing side, and `None.left` crashes. Let `None` be the base case and leaves take care of themselves.
- Forgetting the `1 +`. Without counting the node itself, every answer comes out `0`.
