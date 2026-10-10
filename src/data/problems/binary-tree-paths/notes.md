## Approach

Depth-first search with a path that grows on the way down and shrinks on the way back up: the backtracking skeleton applied to a tree.

```
dfs(node):
    path.append(str(node.val))              # choose
    if node is a leaf:
        record "->".join(path)
    else:
        dfs(child) for each child that exists   # explore
    path.pop()                              # un-choose
```

The tree decides the choices (left, right), and every root-to-leaf path is an answer, so there is nothing to prune. Correctness is just "visit every node once, and record exactly at the leaves": each leaf has exactly one path from the root, and at the moment the search stands on it, `path` holds exactly that path's values.

The one real decision is **where a path ends**. Only a node with *no* children is a leaf. Recording when you fall off the tree (`node is None`) is the classic slip: a leaf has two `None` children, so its path is recorded twice, and a node with a single child produces a path that stops in the middle of the tree.

Keeping a list and joining at the leaf builds each string once. The alternative, passing a string down (`trail + "->" + str(val)`), is just as correct and reads well; it builds a new string at every node instead of every leaf, which only matters for deep trees.

## Complexity

Every node is visited once, and each leaf builds a string of length `O(h)` for a tree of height `h`: `O(n · h)` in the worst case, `O(n log n)` for a balanced tree. Extra space is `O(h)` for the path and the recursion, plus the output.

## Pitfalls

- Recording at `None` children: duplicated leaves and half-finished paths.
- Collecting the answer in a set. When values repeat, two different leaves can produce the same string, and both must be returned.
- Hand-built formatting of negatives: after `10`, the value `-3` gives `"10->-3"`. `str(val)` gets it right.
