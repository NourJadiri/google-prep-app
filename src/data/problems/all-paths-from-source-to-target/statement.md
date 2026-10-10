# All Paths From Source to Target

## The task

A directed graph has `n` nodes labelled `0` to `n - 1` and **no cycles**: once you leave a node, no sequence of edges leads back to it. It comes as an adjacency list, where `graph[i]` lists every node that node `i` has an edge *to*.

Return every path that starts at node `0` and ends at node `n - 1`, each written as the list of nodes it visits, in order. The paths can come in any order. If node `n - 1` can't be reached from node `0`, return `[]`.

Only node `n - 1` ends a path; any other node with no way out is just a dead end. Labels say nothing about direction (an edge can run from a higher label to a lower one), and edges may point into node `0` or out of node `n - 1`.

## Examples

**Example 1**

```
graph = [[1,2,3],[4],[1,4],[4],[]]   -> [[0,1,4],[0,2,1,4],[0,2,4],[0,3,4]]
```

Four routes reach node `4`. Two of them pass through node `1` (paths are free to share nodes), and one detours `2 → 1`, against the label order.

**Example 2**

```
graph = [[1,2],[],[1]]   -> [[0,2]]
```

Node `1` has no way out, but it isn't the target, so `0 → 1` is not an answer. The edge `2 → 1` leaves the target: a path is complete the moment it arrives at node `2`.

**Example 3**

```
graph = [[1],[],[1]]   -> []
```

No edge leads into node `2`, so there is no path at all.

## Constraints

- `n == graph.length`
- `2 <= n <= 15`
- `0 <= graph[i][j] < n`, and `graph[i][j] != i`
- The nodes listed in each `graph[i]` are distinct.
- The graph has no directed cycle.

## Aim for

Depth-first search from node `0`, carrying the current path: append a neighbour, recurse, pop it (choose, explore, un-choose). Whenever you stand on `n - 1`, record a *copy* of the path. No visited set: the graph is acyclic, so a path can't revisit a node, and different paths must be allowed to share them. There can be `2^(n-2)` paths, so `O(2^n · n)` time is simply the cost of writing the answer down.

## Follow-ups

- Only count the paths. (Memoise "number of paths from here to the target" per node: `O(n + edges)`.)
- The graph may now contain cycles. Return every path that never repeats a node. What must the search track that it didn't before?
- Return only the paths with the fewest edges.
