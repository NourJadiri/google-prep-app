# Binary Tree Maximum Path Sum

## The task

A path in a binary tree is a sequence of nodes in which each consecutive pair is joined by a parent-child edge and no node appears twice. It can start and end at any nodes, it doesn't have to pass through the root, and a single node is a path too. Read end to end, a path climbs to its highest node and then comes back down, never branching. Its sum is the total of its nodes' values.

Given the `root` of a non-empty binary tree, return the largest sum of any path.

Trees are given and shown in LeetCode's level order: the values level by level, left to right, with `null` for a missing child. For example, `[1,2,3,null,4]` is a root `1` with children `2` and `3`, and `4` is the right child of `2`.

## Examples

**Example 1**

```
root = [-3,9,-8,4,5,null,2]   -> 18
```

The path `4 -> 9 -> 5` sums to `18`. Every path that reaches the root does worse, because the `-3` only drags it down.

**Example 2**

```
root = [5,-10,8,null,null,-2,7]   -> 20
```

The path `5 -> 8 -> 7`. The `-10` and the `-2` are better left out; a path doesn't have to end at a leaf.

**Example 3**

```
root = [-4,-2,-6]   -> -2
```

Every value is negative, so the best path is the single node `-2`. A path can't be empty.

## Constraints

- `1 <= number of nodes <= 3 * 10^4`
- `-1000 <= Node.val <= 1000`
- The tree is at most `1000` levels deep.

## Aim for

`O(n)` time in one post-order pass, with `O(h)` stack. The contract with each child: hand up your best *downward* gain, which is your value plus the better of your children's gains, with a negative gain counted as `0` (that branch simply isn't taken). While at a node, the best path that *bends* there is its value plus both of those gains; keep the maximum over all nodes. The answer lives at a bend, but only one branch can carry on up to the parent.

## Follow-ups

- Return the path itself, not just its sum.
- Only paths that run from the root down to a leaf count. What gets simpler?
- The same question on a tree where a node can have any number of children. What do you keep per node now?
