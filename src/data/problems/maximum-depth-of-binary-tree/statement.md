# Maximum Depth of Binary Tree

## The task

You're given the `root` of a binary tree. Return its **maximum depth**: the number of nodes on the longest path that starts at the root and steps down from parent to child until it reaches a leaf (a node with no children).

A tree that is just a root has depth `1`. An empty tree — `root` is `None` — has depth `0`.

Trees are written in level order: the values row by row from the top, each row left to right, with `null` where a child is missing. Missing children after the last node are left off. So `[8,3,10,null,6]` is a root `8` with children `3` and `10`, and `3` has no left child but a right child `6`.

## Examples

**Example 1**

```
root = [8,3,10,null,6,null,14,4]   -> 4
```

The longest path is `8 → 3 → 6 → 4`, four nodes. The deepest leaf isn't on the tree's left or right edge — it's tucked inside.

**Example 2**

```
root = [1,null,2,null,3]   -> 3
```

Every node has only a right child, so the whole tree is one path of three nodes.

**Example 3**

```
root = []   -> 0
```

An empty tree has no nodes, so there's no path to measure.

## Constraints

- `0 <= number of nodes <= 10^4`
- `-100 <= Node.val <= 100`
- The tree is at most `1000` levels deep.

## Aim for

Don't try to trace the whole tree in your head. Ask instead: if someone handed you the depth of the root's left subtree and the depth of its right subtree, how would you get the depth of the whole tree? And what is the depth of an empty tree? Answer those two questions and you have a short recursive solution — `O(n)` time, plus `O(h)` stack for a tree `h` levels tall.

## Follow-ups

- Do it without recursion: walk the tree one level at a time with a queue and count the levels.
- Minimum depth asks for the shortest root-to-leaf path instead. Why doesn't swapping `max` for `min` work? (Think about a node with only one child.)
- What would your recursive version do on a tree that's one path 100,000 nodes long, and how would you avoid that?
