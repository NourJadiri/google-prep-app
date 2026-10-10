# Shortest Path Visiting All Nodes

## The task

You're given an undirected, connected graph with `n` nodes labelled `0` to `n - 1`, as adjacency lists: `graph[i]` lists the neighbours of node `i`.

Return the length of the shortest walk that visits every node at least once, counted as the number of edges walked. The walk can start and end at any nodes, and it may pass through nodes and reuse edges as often as it likes.

## Examples

**Example 1**

```
graph = [[1],[0,2,4],[1,3],[2],[1]]   -> 5
```

`0 → 1 → 4 → 1 → 2 → 3`. The tree has three leaves, so every walk has to double back somewhere. The best ones double back over a single edge.

**Example 2**

```
graph = [[1,2],[0],[0,3],[2]]   -> 3
```

The nodes form the line `1 – 0 – 2 – 3`. Starting at node `1` walks it end to end in `3` steps. Starting at node `0` would cost one extra step to come back.

**Example 3**

```
graph = [[]]   -> 0
```

A single node is visited before any step is taken.

## Constraints

- `n == graph.length`
- `1 <= n <= 12`
- `0 <= graph[i].length < n`
- `graph[i]` doesn't contain `i` and has no repeats.
- If `j` is in `graph[i]`, then `i` is in `graph[j]`.
- The graph is connected.

## Aim for

Visiting everything means the search state has to remember what's been visited: `(bitmask of visited nodes, current node)`, at most `12 * 2^12 = 49,152` states. Run BFS over those states, seeded with all `n` single-node states at once because the start is free, and stop at the first state whose mask is full. Each BFS layer is one more edge. `O(2^n * n^2)` time and `O(2^n * n)` space. Trying every order of the nodes would be `n!`, which is 479 million orders at `n = 12`.

## Follow-ups

- Return the walk itself, not just its length.
- The walk must start and end at node `0`. What changes?
- Edges get lengths. Which search do you switch to, over which states?
