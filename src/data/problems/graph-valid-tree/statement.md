# Graph Valid Tree

Stands in for LeetCode 261 (premium). Original statement written for this app — same task, own words and examples.

## The task

A technician wired up `n` network switches, labelled `0` to `n - 1`, with undirected cables given as `edges[i] = [a, b]`. Decide whether the result is a **tree**: every switch reachable from every other, and no redundant cable anywhere (no cycle).

Implement `validTree(n, edges)`, returning `True` if the wiring is a tree and `False` otherwise.

## Examples

**Example 1**

```
n = 4, edges = [[0,1],[1,2],[2,3]]        -> true
```

A simple chain: connected, three edges, no loop.

**Example 2**

```
n = 5, edges = [[0,1],[1,2],[2,0],[3,4]]  -> false
```

Two failures at once: `0-1-2` forms a cycle, and `{3,4}` is cut off from the rest.

**Example 3**

```
n = 3, edges = [[0,1]]                    -> false
```

No cycle, but switch `2` is on its own desk. Connectivity is half the definition.

**Example 4**

```
n = 1, edges = []                         -> true
```

A single node is a (small, proud) tree.

## Constraints

- `1 <= n <= 2000`, `0 <= edges.length <= 5000`
- `edges[i] = [a, b]` with `0 <= a, b < n`
- No self-loops, no duplicate cables (`[a, b]` and `[b, a]` would be the same cable).

## Aim for

The one-line theorem before any traversal: a graph is a tree **iff** it has exactly `n - 1` edges **and** is connected. Check the count first — it's free — then verify connectivity with a DFS *or* by running union-find and confirming no union ever joins two nodes already in the same set. Either is `O(n + e)`; the union-find version is the day's re-drill.

## Follow-ups

- Why does `n - 1` edges + connected imply no cycle? (Pigeonhole on components.)
- Directed version: what extra conditions make it a rooted tree?
- Edges stream in one at a time and you must answer after each — which approach survives? (That is tomorrow's Number of Islands II muscle.)
