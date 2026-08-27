# Graph Valid Tree — in-app drill

**Day 12 · Union Depot · Medium · union-find / components**
Stands in for LeetCode 261 (premium). Original statement written for this app — same task, own words and examples.

## The task

A technician wired up `n` network switches, labelled `0` to `n - 1`, with undirected cables given as `edges[i] = [a, b]`. Decide whether the result is a **tree**: every switch reachable from every other, and no redundant cable anywhere (no cycle).

Return `true` or `false`.

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
- No self-loops, no duplicate cables.

## Aim for

The one-line theorem before any traversal: a graph is a tree **iff** it has exactly `n - 1` edges **and** is connected. Check the count first — it's free — then verify connectivity with a DFS *or* by running union-find and confirming no union ever joins two nodes already in the same set. Either is `O(n + e)`; the union-find version is the day's re-drill.

## Interviewer follow-ups to be ready for

- Why does `n - 1` edges + connected imply no cycle? (Pigeonhole on components.)
- Directed version: what extra conditions make it a rooted tree?
- Edges stream in one at a time and you must answer after each — which approach survives? (That is tomorrow's Number of Islands II muscle.)

---
*Paste everything above into Claude and ask it to play interviewer — have it hold the solution back until you've talked through an approach and a complexity out loud.*
