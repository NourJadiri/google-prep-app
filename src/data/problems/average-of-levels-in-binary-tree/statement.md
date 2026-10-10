# Average of Levels in Binary Tree

## The task

You're given the `root` of a binary tree. Return a list holding the average value of the nodes on each level, starting from the top level (just the root) and going down.

A level is every node at the same depth — the root is level 1, its children are level 2, their children level 3, and so on — whether or not those nodes share a parent. Each average is a float, and answers within `10^-5` of the exact average are accepted.

Trees are written in level order: the values row by row from the top, each row left to right, with `null` where a child is missing. Missing children after the last node are left off.

## Examples

**Example 1**

```
root = [10,4,7,null,1,0]   -> [10.0,5.5,0.5]
```

Level 2 holds `4` and `7`, average `5.5`. Level 3 holds `1` and `0`: cousins rather than siblings, but on the same level.

**Example 2**

```
root = [-3,8,null,-6,5]   -> [-3.0,8.0,-0.5]
```

`(-6 + 5) / 2 = -0.5`. Floor division would give `-1` here.

**Example 3**

```
root = [2147483647,2147483647,2147483647]   -> [2147483647.0,2147483647.0]
```

Python's integers can't overflow, but in a language with 32-bit integers, adding up the second level would.

## Constraints

- `1 <= number of nodes <= 10^4`
- `-2^31 <= Node.val <= 2^31 - 1`
- The tree is at most `1000` levels deep.

## Aim for

"Level" is the signal for breadth-first search. Visit the tree one level at a time with a queue; the trick is knowing where one level ends and the next begins. At the moment you start a level, which nodes in the queue belong to it? Add up exactly those, and queue their children for the next round. `O(n)` time, plus `O(w)` space for the widest level.

## Follow-ups

- Do it with depth-first search instead, keeping a running total and count for each depth.
- Return each level's values, or each level's largest value, or the levels in zigzag order — the same loop with different bookkeeping.
- In a language with 32-bit integers, how would you add up a level without overflowing?
