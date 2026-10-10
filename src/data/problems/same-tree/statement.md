# Same Tree

## The task

You're given the roots `p` and `q` of two binary trees. Return `True` if the two trees are the same, and `False` otherwise.

Two trees are the same when they have exactly the same shape and the nodes in matching positions hold equal values. Two empty trees are the same; an empty tree is never the same as a non-empty one.

Trees are written in level order: the values row by row from the top, each row left to right, with `null` where a child is missing. Missing children after the last node are left off, and an empty tree is `[]` (its root is `None`).

## Examples

**Example 1**

```
p = [5,3,8,1], q = [5,3,8,1]   -> true
```

**Example 2**

```
p = [4,7], q = [4,null,7]   -> false
```

The same values, but different shapes: `7` is a left child in `p` and a right child in `q`.

**Example 3**

```
p = [], q = [3]   -> false
```

An empty tree only matches another empty tree.

## Constraints

- `0 <= number of nodes in each tree <= 100`
- `-10^4 <= Node.val <= 10^4`

## Aim for

What has to be true about the two roots, the two left subtrees and the two right subtrees for the whole trees to be the same? Your answer refers to the same question on smaller trees — that's your recursion. Settle the cases where one or both trees are empty first: they're the base cases, and they're where the bugs hide. `O(n)` time and `O(h)` stack.

## Follow-ups

- Do it without recursion: walk both trees in lockstep with a queue of node pairs.
- Comparing two traversal lists only works if you also record the missing children. Why? (Example 2 shows it.)
- What if two trees also count as the same when you're allowed to swap the children of any nodes?
