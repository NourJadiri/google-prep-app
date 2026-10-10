# Binary Tree Paths

## The task

Given the `root` of a binary tree, return every path from the root down to a leaf (a node with no children), written as a string: the node values in order, joined by `"->"`. The path through the values `8`, `3`, `2` is `"8->3->2"`.

Values are written in plain decimal with their minus sign, so a path from `4` to `-7` reads `"4->-7"`. Return the strings in any order. When values repeat, two different leaves can produce the same string; list it once per leaf.

The tree is given and shown in level order (LeetCode's format), with `null` for a missing child: `[8,3,6,null,2]` is a root `8` with children `3` and `6`, where `3` has only a right child, `2`.

## Examples

**Example 1**

```
root = [4,9,0,null,1,6]   -> ["4->9->1","4->0->6"]
```

`9` has a right child, so it isn't a leaf: its path continues down to `1`.

**Example 2**

```
root = [10,-3,null,8,-1]   -> ["10->-3->8","10->-3->-1"]
```

**Example 3**

```
root = [-7]   -> ["-7"]
```

A lone root is a leaf: one path, one value.

## Constraints

- `1 <= number of nodes <= 100`
- `-100 <= Node.val <= 100`

## Aim for

One depth-first pass. Keep the values on the current path in a list: push a node's value on the way down, emit `"->".join(path)` at a leaf, pop on the way back up (choose, explore, un-choose). Test for a leaf explicitly (no left *and* no right child): recording at `None` children counts every leaf twice and invents paths that stop at one-child nodes. `O(n · h)` time for height `h` (the strings alone can be that long), `O(h)` extra space.

## Follow-ups

- Return the paths as lists of values and keep only those with a given sum (Path Sum II).
- Do it iteratively with an explicit stack. What does each stack entry need to carry?
- Return only the longest root-to-leaf path. Can you avoid building the others?
