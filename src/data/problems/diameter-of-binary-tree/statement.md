# Diameter of Binary Tree

## The task

You're given the `root` of a binary tree. Return its **diameter**: the length of the longest path between any two nodes.

A path travels along the tree's edges — from a node to its parent or to one of its children — and never visits a node twice. Its length is the number of **edges** it uses, not the number of nodes. The longest path may pass through the root, but it doesn't have to.

Trees are written in level order: the values row by row from the top, each row left to right, with `null` where a child is missing. Missing children after the last node are left off.

## Examples

**Example 1**

```
root = [5,3,8,1,null,null,9,0]   -> 5
```

The longest path is `0 → 1 → 3 → 5 → 8 → 9`: six nodes, five edges.

**Example 2**

```
root = [1,2,null,3,4,5,null,null,6]   -> 4
```

The longest path, `5 → 3 → 2 → 4 → 6`, bends at `2` and never touches the root. Any path through the root is at most 3 edges long.

**Example 3**

```
root = [8]   -> 0
```

A single node: a path with no edges.

## Constraints

- `1 <= number of nodes <= 10^4`
- `-100 <= Node.val <= 100`
- The tree is at most `1000` levels deep.

## Aim for

Every path has one highest node — the place where it bends. If you knew how deep a node's left subtree goes and how deep its right subtree goes, how long is the longest path that bends at that node? Measuring heights from scratch at every node repeats work, `O(n·h)` for a tree `h` levels tall. Aim for a single pass, `O(n)`, in which each call returns one thing to its parent while keeping track of another.

## Follow-ups

- Return the two end nodes of a longest path, not just its length.
- Give every node a value and look for the path with the largest sum instead. (The same shape solves the classic hard problem "maximum path sum".)
- Find the diameter of a general tree given as a list of edges.
