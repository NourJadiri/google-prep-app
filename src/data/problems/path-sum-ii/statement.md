# Path Sum II

## The task

Given the `root` of a binary tree and an integer `targetSum`, return every root-to-leaf path whose values add up to exactly `targetSum`. A path starts at the root and ends at a leaf (a node with no children), and is written as the list of its node values from root to leaf.

Return the paths in any order. When values repeat, two different leaves can give identical lists; each counts separately. An empty tree has no paths, whatever the target.

The tree is given in level order with `null` for a missing child, and `[]` is the empty tree. Values can be negative, so a running sum can pass the target and come back.

## Examples

**Example 1**

```
root = [6,2,-3,5,-1,null,10,null,null,4], targetSum = 13   -> [[6,2,5],[6,-3,10]]
```

The three root-to-leaf sums are `6 + 2 + 5 = 13`, `6 + 2 - 1 + 4 = 11` and `6 - 3 + 10 = 13`.

**Example 2**

```
root = [2,7,null,-7,1], targetSum = 2   -> [[2,7,-7]]
```

The root alone already sums to `2`, but it isn't a leaf. Going left, the sum climbs to `9` before `-7` brings it back to `2` at a leaf.

**Example 3**

```
root = [], targetSum = 0   -> []
```

## Constraints

- `0 <= number of nodes <= 5000`
- `-1000 <= Node.val <= 1000`
- `-1000 <= targetSum <= 1000`
- The tree is at most `1000` levels deep.

## Aim for

Backtracking DFS carrying the path and the amount still missing: push the value and subtract it (choose), recurse into the children (explore), pop on the way out (un-choose). Test `remaining == 0` only at a leaf, and never cut a branch short because the sum overshot: negative values can undo it. Every node is visited once and only matches get copied, so `O(n + k · h)` time for `k` matching paths in a tree of height `h`, and `O(h)` space besides the output.

## Follow-ups

- Paths may start and end anywhere, as long as they run downward: count them. (Prefix sums along the current path, Path Sum III.)
- Only say whether a matching path exists. What can you stop doing?
- Make it iterative. What does the stack need to remember to un-choose correctly?
