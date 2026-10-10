# Symmetric Tree

## The task

You're given the `root` of a binary tree. Return `True` if the tree is symmetric — a mirror image of itself across the vertical line through the root — and `False` otherwise.

Picture folding the tree along that line. Every node on the left has to land on a node on the right holding the same value, and every missing child has to land on a missing child.

Trees are written in level order: the values row by row from the top, each row left to right, with `null` where a child is missing. Missing children after the last node are left off.

## Examples

**Example 1**

```
root = [4,6,6,1,3,3,1]   -> true
```

Below the two `6`s, the outer children are both `1` and the inner children are both `3`.

**Example 2**

```
root = [5,1,1,2,null,2]   -> false
```

Both `2`s are left children. In a mirror image, a left child on one side must face a right child on the other.

**Example 3**

```
root = [7]   -> true
```

A single node is its own mirror image.

## Constraints

- `1 <= number of nodes <= 1000`
- `-100 <= Node.val <= 100`

## Aim for

The root is fine on its own — what matters is whether its left subtree is the mirror image of its right subtree. That's a question about two trees at once, so write a helper that takes two nodes and decides whether their trees mirror each other. Same Tree compared left with left and right with right; which children have to be compared here? `O(n)` time, `O(h)` stack.

## Follow-ups

- Do it iteratively with a queue of node pairs.
- Checking that every level reads the same backwards: does it work if you skip the missing children? What if you keep a `null` for each one?
- If a tree's in-order traversal reads the same backwards, is the tree symmetric?
