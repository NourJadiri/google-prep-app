## Approach

Ask what you need from each level: only its last node. Breadth-first search gives you whole levels, so the answer drops straight out.

Keep the current level as a list of nodes, left to right. Record the value of its last node. Then build the next level from the children of this one, taking each node's left child before its right. Stop when a level comes out empty.

Why it's correct: each list holds exactly the nodes at one depth, in left-to-right order. That's true for the root. If it's true for one level, it's true for the next, because the children of a left-to-right list, each node's left child before its right, are still left to right. The node you see from the right is the rightmost node at its depth, and it can live in the *left* subtree when the right subtree is shallower. That's exactly why walking down the right edge of the tree isn't enough.

The depth-first version uses the same idea. Visit the right child before the left and pass the depth along. The first node you reach at each depth is the rightmost one there, so record a value whenever `depth == len(view)`.

## Complexity

`O(n)` time: every node joins exactly one level. Space: the BFS holds one level at a time, `O(width)`, which is up to about `n / 2` for a complete tree. The DFS uses `O(height)` of call stack instead: `O(log n)` when the tree is balanced, but `O(n)` when it's one long chain.

## Pitfalls

- Walking one path down the right side (`node = node.right or node.left`). In `[1,2,3,4]` the right child `3` is a leaf, but the third level still has a node: `4`, under the left child.
- Building the next level right to left and then reading its last element. Whichever order you build in, read the matching end.
- Forgetting the empty tree: `[]` should give `[]`, not a crash.
