## Approach

The tree recursion from Maximum Depth and Invert Binary Tree, now walking two trees in lockstep. Say what a call answers: `isSameTree(p, q)` tells you whether the tree starting at `p` and the tree starting at `q` are identical.

Settle the empty cases first. They're the base cases, and most bugs in this problem live here:

- **Both empty:** two empty trees are identical — return `True`.
- **Exactly one empty:** one tree has a node where the other has nothing — return `False`.

Only now are both `p` and `q` real nodes, so only now is it safe to read `.val`. The trees are identical exactly when three things hold: the root values are equal, the left subtrees are identical, and the right subtrees are identical. The last two are the same question on smaller trees, so hand them to the recursion and trust the answers. Chain the three checks with `and`, the cheap value check first; `and` stops at the first `False`, so the walk ends at the first difference it meets.

Why is that enough? Each call compares one pair of matching positions and passes the pairs of children down. Every position that exists in either tree is eventually paired with the same position in the other: if both have a node there, the values are compared; if only one does, the "exactly one empty" rule catches it. So `True` comes back only when every position matches.

Why not compare traversals instead? In Example 2, `[4,7]` and `[4,null,7]` both read `4, 7` in preorder: a list of values throws the shape away. It works again if you write a marker such as `None` for every missing child — but the direct comparison is shorter and stops early.

The pattern to remember is "walk two trees at once": a recursive call that takes a pair of nodes and checks the empty cases before anything else. You'll use it again straight away — Symmetric Tree compares a tree against its own mirror image, and Subtree of Another Tree runs this exact function from every node.

## Complexity

`O(n)` time in the worst case — identical trees force a look at every node — and it stops sooner at the first difference. `O(h)` extra space for the call stack, where `h` is the height of the shorter tree.

## Pitfalls

- Reading `p.val` before checking that both nodes exist. When exactly one is `None`, that crashes with `AttributeError`.
- Treating "exactly one empty" as a match, or testing only `p is None`. Spell out all the cases: both empty, then either one empty.
- Comparing traversal lists that skip the missing children. Different shapes can give exactly the same list.
