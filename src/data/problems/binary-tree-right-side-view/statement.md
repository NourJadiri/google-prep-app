# Binary Tree Right Side View

## The task

Stand to the right of a binary tree and look at it level by level. On each level you see exactly one node: the rightmost node of that level. Given the `root` of a binary tree, return the values you see, from the top level down.

The rightmost node of a level can sit in the left subtree, when the right subtree doesn't reach that deep.

Trees are given and shown in LeetCode's level order: the values level by level, left to right, with `null` for a missing child. For example, `[1,2,3,null,4]` is a root `1` with children `2` and `3`, and `4` is the right child of `2`. An empty tree is `[]`, and its root is `None`.

## Examples

**Example 1**

```
root = [6,2,9,1,4,null,11,null,null,3]   -> [6,9,11,3]
```

Down the right edge you see `6`, `9` and `11`. The bottom level holds only `3`, the left child of `4`, which sits in the left subtree, and nothing stands to its right.

**Example 2**

```
root = [5,3,null,1]   -> [5,3,1]
```

Every node is a left child and alone on its level, so all of them are visible.

**Example 3**

```
root = []   -> []
```

## Constraints

- `0 <= number of nodes <= 10^4`
- `-100 <= Node.val <= 100`
- The tree is at most `1000` levels deep.

## Aim for

`O(n)` time. Go breadth-first, one whole level at a time; the last node of each level is the one you see. Or go depth-first, visiting the right child before the left, and record the first node you reach at each new depth. Extra space is `O(width)` for the BFS and `O(height)` for the DFS — know which you'd pick for a tall, thin tree.

## Follow-ups

- Return the left side view. Can one traversal produce both views?
- The view from below: for each vertical column, the lowest node. What extra state does each node carry through the traversal?
- A tree 10^6 levels deep and one node wide — which version still works, and what would you change in the other?
