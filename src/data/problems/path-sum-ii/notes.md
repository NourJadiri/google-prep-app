## Approach

Backtracking over the tree, carrying two things down: the values on the current path, and how much of `targetSum` is still missing.

```
dfs(node, remaining):
    path.append(node.val)                  # choose
    remaining -= node.val
    if node is a leaf:
        if remaining == 0: record path[:]
    else:
        dfs(child, remaining) for each child that exists   # explore
    path.pop()                             # un-choose
```

`remaining` travels as an argument, so it un-chooses itself when the call returns; `path` is one shared list, so it needs the explicit `pop`. Record a **copy**, because the list keeps changing after you record it.

Two rules carry the correctness:

1. **Test only at leaves.** A path must end at a node with no children. Hitting the target at an inner node means nothing (Example 2's root), and a node with one child is not a leaf: the path has to continue down the side that exists.
2. **Never prune on the running sum.** With non-negative values you could abandon a branch once `remaining < 0`. Here values go down to `-1000`, so a sum that overshoots can come back (Example 2 climbs to `9` and returns to `2`). Every root-to-leaf path has to be walked to its end.

With those two rules, the search visits every root-to-leaf path exactly once, and records it exactly when its sum is the target.

## Complexity

Each node is pushed and popped once: `O(n)`. Each match costs an `O(h)` copy, so the total is `O(n + k · h)` for `k` matching paths. In the worst case (a tree where every path matches, such as all zeros with target `0`) that is `O(n · h)`, the size of the output. Extra space is `O(h)` for the path and the recursion; the tree here is at most `1000` levels deep, so recursion is safe.

## Pitfalls

- Pruning when the sum passes the target: wrong as soon as values can be negative.
- Checking the sum at `None` children: a one-child node then counts as the end of a path.
- Passing `path + [node.val]` down at every node: correct, but it copies the path at every step, `O(n · h)` even when nothing matches.
- De-duplicating the answer: equal values can make two different paths look identical, and both belong in the output.
