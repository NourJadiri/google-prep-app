# Balanced Binary Tree

## The task

You're given the `root` of a binary tree. Return `True` if the tree is **height-balanced**, and `False` otherwise.

A tree is height-balanced when, at **every** node, the heights of that node's left and right subtrees differ by at most `1`. The height of a tree is the number of nodes on the longest path down from its root; an empty tree has height `0`, and an empty tree is balanced.

Trees are written in level order: the values row by row from the top, each row left to right, with `null` where a child is missing. Missing children after the last node are left off.

## Examples

**Example 1**

```
root = [6,4,9,2,null,7,12]   -> true
```

Node `4` has a left child but no right child: heights `1` and `0` differ by `1`, which is allowed. Every other node is evenly matched.

**Example 2**

```
root = [10,5,15,3,null,null,20,1,null,null,25]   -> false
```

The root is fine — both of its subtrees are 3 tall. But node `5` has a left subtree 2 tall and no right subtree at all, a difference of `2`.

**Example 3**

```
root = []   -> true
```

## Constraints

- `0 <= number of nodes <= 5000`
- `-10^4 <= Node.val <= 10^4`
- The tree is at most `1000` levels deep.

## Aim for

The definition suggests a direct approach: at every node, measure both subtree heights with a helper and compare them. That works, but it measures the same subtrees over and over — `O(n log n)` on a bushy tree, `O(n·h)` in general. You compute heights recursively anyway, so let one recursive call return the height of its subtree and also find a way for it to report "unbalanced somewhere below me". One visit per node: `O(n)`.

## Follow-ups

- Return the topmost node where the balance fails, or `None` if the tree is balanced.
- Self-balancing search trees (AVL trees) keep exactly this property after every insertion. What would each node have to store to check it in `O(1)`?
- Rebuild an unbalanced binary search tree into a balanced one holding the same values.
