# Lowest Common Ancestor of a Binary Tree

## The task

You get the `root` of a binary tree and two different nodes of it, `p` and `q`. Return their lowest common ancestor: the deepest node that has both `p` and `q` in its subtree. A node counts as part of its own subtree, so if `p` sits somewhere below `q`, the answer is `q` itself.

Return the node itself, one of the tree's own nodes, not its value or a copy of it.

Trees are given and shown in LeetCode's level order: the values level by level, left to right, with `null` for a missing child. All values in a tree are distinct, so the examples name `p` and `q` by their values. Your function receives the nodes themselves, and the expected output is the value of the node you should return.

## Examples

**Example 1**

```
root = [7,3,9,4,1,null,8,null,null,6,2], p = 6, q = 4   -> 3
```

`4` is the left child of `3`, and `6` hangs below `1`, the right child of `3`. Coming down from the root, the paths to the two nodes part ways at `3`.

**Example 2**

```
root = [7,3,9,4,1,null,8,null,null,6,2], p = 1, q = 2   -> 1
```

`2` is a child of `1`, and `1` is part of its own subtree, so the answer is `1` itself.

**Example 3**

```
root = [5,8], p = 8, q = 5   -> 5
```

## Constraints

- `2 <= number of nodes <= 10^5`
- `-10^9 <= Node.val <= 10^9`
- All values in the tree are distinct.
- `p != q`, and both are nodes of the tree.
- The tree is at most `1000` levels deep.

## Aim for

`O(n)` time in one post-order pass, with `O(h)` stack. Every call reports what its subtree holds: `p` or `q` if it found just one of them, the answer if it found both, `None` if neither. The first node to hear back from both sides is where the paths split. The alternative is a parent map and a climb from both nodes. Know what that costs in memory.

## Follow-ups

- Every node has a `parent` pointer and you aren't given the root. Find the LCA in `O(h)` time and `O(1)` extra space.
- `p` or `q` might not be in the tree, and then the answer is `None`. What breaks in the one-pass solution, and how do you fix it?
- A fixed tree gets many LCA queries. What would you precompute so that each query is fast?
- The tree is a binary search tree. What's the shortcut?
