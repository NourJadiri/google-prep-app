# House Robber III

## The task

House Robber, moved from a street to a tree. Every node of a binary tree is a house holding `Node.val` in cash. You may rob any set of houses, as long as no two of them are directly linked: never a node together with its parent or with one of its children. A grandparent and its grandchild are fine. Given the `root`, return the largest total you can take.

Trees are given and shown in LeetCode's level order: the values level by level, left to right, with `null` for a missing child. For example, `[1,2,3,null,4]` is a root `1` with children `2` and `3`, and `4` is the right child of `2`.

## Examples

**Example 1**

```
root = [2,1,3,null,4]   -> 7
```

Rob `3` and `4`. They sit in different branches and aren't linked, and together they beat any set that includes the root (`2 + 4 = 6`).

**Example 2**

```
root = [5,1,null,1,null,5]   -> 10
```

The tree is a chain `5 - 1 - 1 - 5`. Rob both `5`s and skip the two `1`s between them: nothing forces you to take every other level.

**Example 3**

```
root = [10]   -> 10
```

## Constraints

- `1 <= number of nodes <= 10^4`
- `0 <= Node.val <= 10^4`
- The tree is at most `1000` levels deep.

## Aim for

`O(n)` time in one post-order pass, with `O(h)` stack. The contract per node is a pair: the best total in its subtree if it's robbed, and the best if it isn't. Robbed means its value plus both children's "not robbed" totals. Not robbed means each child independently takes the better of its two. The answer is the better of the root's pair. The tempting recursion "this node plus the grandchildren, or the children" is correct but exponential without memoisation. Say why, then return the pair instead.

## Follow-ups

- Return which houses to rob, not just the total.
- Robbed houses must now be at least three edges apart. What does each node hand up?
- The houses form an arbitrary graph rather than a tree. Why does the problem get so much harder?
