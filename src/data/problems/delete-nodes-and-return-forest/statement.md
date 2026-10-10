# Delete Nodes And Return Forest

## The task

You get the `root` of a binary tree whose values are all distinct, and a list `to_delete`. Remove every node whose value appears in `to_delete`. A removed node is cut off from its parent and from its children, so the tree breaks apart into a forest. A surviving node becomes the root of its own tree when its parent was removed; the original root starts a tree too, if it survives.

Return the roots of all the trees that remain, in any order. Every tree keeps its original shape, minus the removed nodes. Values in `to_delete` that aren't in the tree are ignored.

Trees are given and shown in LeetCode's level order: the values level by level, left to right, with `null` for a missing child. The expected output lists each remaining tree that way, for example `[[4],[5,null,2]]`.

## Examples

**Example 1**

```
root = [5,9,2,4,7,null,8,null,null,3,6], to_delete = [9,8]   -> [[4],[5,null,2],[7,3,6]]
```

Removing `9` sets its children `4` and `7` loose as new roots. Removing the leaf `8` just cuts it from `2`. The root `5` keeps what's left of the original tree.

**Example 2**

```
root = [1,2,3,null,4], to_delete = [1,2]   -> [[3],[4]]
```

`2` is removed along with its parent, so its child `4` starts a tree of its own. A child of a removed node becomes a root only if it survives itself.

**Example 3**

```
root = [4,2], to_delete = [2,4]   -> []
```

Nothing survives, so the forest is empty.

## Constraints

- `1 <= number of nodes <= 1000`
- `1 <= Node.val <= 1000`, and all values in the tree are distinct.
- `1 <= to_delete.length <= 1000`
- `to_delete` holds distinct values between `1` and `1000`.

## Aim for

`O(n + d)` time in one DFS, with the values to delete in a hash set. The contract per node runs both ways. Going down, a parent tells its child whether the parent itself was removed: a surviving node with no surviving parent is a new root. Coming back up, the child returns either itself or `None`, and the parent stores that straight into its child pointer, which is what cuts the links. The set matters, because `in` on a list costs `O(d)` per check.

## Follow-ups

- Return the trees sorted by size, largest first.
- Deletions arrive one at a time, and after each one you must report how many trees there are. What do you keep up to date?
- Do it iteratively, without recursion.
