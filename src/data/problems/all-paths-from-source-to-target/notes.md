## Approach

This is backtracking on a graph. The state is the path walked so far, starting as `[0]`; every edge out of its last node is a choice.

```
dfs(node):
    if node == target:
        record a copy of path
        return
    for nxt in graph[node]:
        path.append(nxt)    # choose
        dfs(nxt)            # explore
        path.pop()          # un-choose
```

The un-choose step puts `path` back exactly as it was before the choice, so the next neighbour starts from the same prefix. It is also why the recorded path must be a copy (`path[:]`): the list object keeps changing, and storing the object itself would leave every answer pointing at one list that finally reads `[0]`.

Why it's correct: a path from `0` to `n - 1` is a sequence of edge choices, and the loop offers every choice at every step, so each path is reached. Two different paths differ at some first choice, so none is produced twice. The search terminates because the graph is acyclic: no path is longer than `n` nodes.

Notice what is *missing*: a visited set. In a reachability search, "visited" stops you doing the same work twice. Here the work *is* the paths, and paths share nodes; in Example 1, node `1` lies on two answers. A global visited set would keep only the first of them. And on a DAG there is no cycle to guard against.

A variant worth naming: since the graph is acyclic, `paths_from(node)` can be memoised and built bottom-up as `[node] + rest` for each neighbour's paths. It shares work between common suffixes, but the output still dominates the running time.

## Complexity

The complete DAG (an edge from every node to every later one) has `2^(n-2)` paths, because every middle node is either on a path or not. Copying a path costs up to `n`, so the worst case is `O(2^n · n)` time, which is the size of the output; no algorithm can do better. Extra space is `O(n)` for the path and the recursion.

## Pitfalls

- A visited set carried over from graph search: it silently drops every path that reuses a node an earlier path took.
- Appending `path` instead of `path[:]`.
- Recording at nodes with no outgoing edges instead of at `n - 1`. A dead end isn't the target, and the target is allowed to have edges out.
