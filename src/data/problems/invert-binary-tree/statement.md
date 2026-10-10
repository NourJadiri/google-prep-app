# Invert Binary Tree

## The task

You're given the `root` of a binary tree. Invert it — turn it into its mirror image — and return its root.

In the mirror image, the left and right children of **every** node trade places. So the whole subtree that hung on a node's left now hangs on its right, itself mirrored, and the other way round. A missing child moves too: a node with only a left child ends up with only a right child.

You may rearrange the nodes you were given (the usual approach) or build new ones; the tests read whatever tree you return.

Trees are written in level order: the values row by row from the top, each row left to right, with `null` where a child is missing. Missing children after the last node are left off. An empty tree is `[]`, and its `root` is `None`.

## Examples

**Example 1**

```
root = [6,2,9,1,4,7]   -> [6,9,2,null,7,4,1]
```

The subtrees under `6` swap sides. Under `2`, the children `1` and `4` swap; under `9`, the lone left child `7` becomes a lone right child.

**Example 2**

```
root = [3,1]   -> [3,null,1]
```

**Example 3**

```
root = []   -> []
```

The mirror image of an empty tree is an empty tree.

## Constraints

- `0 <= number of nodes <= 100`
- `-100 <= Node.val <= 100`

## Aim for

Describe the mirror image of a tree using the mirror images of its two subtrees. Once you can say that in one sentence, the code is a few lines. Then watch the order in which you change links: don't overwrite a child you still need to read. Every node is touched once — `O(n)` time, `O(h)` stack for a tree `h` levels tall.

## Follow-ups

- Do it without recursion: visit every node with a queue or a stack and swap its two children.
- Leave the input untouched and return a brand-new mirrored tree instead.
- Given two trees, decide whether one is the mirror image of the other without changing either.
