# Validate Binary Search Tree

## The task

Given the `root` of a binary tree, return `True` if it is a valid binary search tree and `False` otherwise.

A binary search tree is valid when, at every node:

- every value in the node's left subtree is strictly smaller than the node's value, and
- every value in its right subtree is strictly larger.

The rule covers whole subtrees, not just a node's two children, and equal values are never allowed.

Trees are given and shown in LeetCode's level order: the values level by level, left to right, with `null` for a missing child. For example, `[2,1,3,null,null,null,4]` is a root `2` with children `1` and `3`, and `4` is the right child of `3`.

## Examples

**Example 1**

```
root = [20,10,30,5,15,null,35]   -> true
```

**Example 2**

```
root = [20,10,30,5,25]   -> false
```

Each node is on the correct side of its own parent: `25` is the right child of `10` and larger than it. But `25` lies in the left subtree of `20`, where every value must be smaller than `20`.

**Example 3**

```
root = [4,null,4]   -> false
```

Equal isn't larger: a right child holding the same value breaks the rule.

## Constraints

- `1 <= number of nodes <= 10^4`
- `-2^31 <= Node.val <= 2^31 - 1`
- The tree is at most `1000` levels deep.

## Aim for

`O(n)` time in a single pass. Every node has to fit inside an interval built up from all of its ancestors: stepping left tightens the upper bound to the parent's value, stepping right tightens the lower bound. Start from `(-inf, +inf)` so the integer limits need no special case. Or, equivalently, an in-order traversal must come out strictly increasing. Extra space is `O(h)` for the recursion or an explicit stack.

## Follow-ups

- Do it iteratively with an explicit stack, stopping at the first violation.
- Exactly two values in an otherwise valid BST were swapped. Find them, and put them back with `O(1)` extra space.
- Return the size of the largest subtree that is a valid BST.
