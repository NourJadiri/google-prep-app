## Approach

Think of the contract between a node and its ancestors. What does a node need to know to judge itself? The interval its value has to lie in. Hand that interval down the tree:

- The root can hold anything: `(-inf, +inf)`.
- Going to a left child, everything below must stay smaller than the current value, so the upper bound becomes `node.val` and the lower bound stays as it was.
- Going to a right child, the lower bound becomes `node.val` and the upper bound stays.

A node whose value falls outside its interval breaks the tree. An empty subtree is always fine.

Why this captures the definition: "everything in the left subtree is smaller than `v`" constrains every node below, not just the left child. Walk from the root down to any node. Every ancestor where the path went left gives an upper bound, and every ancestor where it went right gives a lower bound. The node has to respect all of them, but only the tightest bound of each kind matters, and that pair is exactly the interval being carried down.

There's an equivalent view. A tree is a valid BST exactly when its in-order traversal (left subtree, node, right subtree) is strictly increasing. Keep the previous value as you traverse, and compare each new value against it.

## Complexity

`O(n)` time: each node is visited once, and the search stops at the first violation. `O(h)` extra space for the recursion: `O(log n)` for a balanced tree, `O(n)` for a chain.

Checking the definition literally, by scanning each node's whole subtrees, costs `O(n * h)`. That's fine for balanced trees but quadratic for a tall one. On the largest test here, a spine nearly 1,000 nodes deep with small subtrees hanging off it, it runs about fifty times slower than the one-pass check. It still fits the limit at this size, but it's the answer an interviewer will ask you to improve.

## Pitfalls

- Comparing a node with its children only. `[20,10,30,5,25]` passes every parent-child check and is still invalid.
- Allowing equal values: the comparisons must be strict on both sides.
- Starting the bounds at `-2**31` and `2**31 - 1` and comparing strictly: then a tree whose root is `2147483647` fails, although it's valid. Use infinities, or `None` for "no bound yet".
