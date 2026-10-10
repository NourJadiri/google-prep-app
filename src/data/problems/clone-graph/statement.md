# Clone Graph

## The task

You're handed one node of a connected, undirected graph. Every node has an integer `val` and a list `neighbors` of the nodes it shares an edge with. The class is shown, commented out, at the top of the editor. Return a deep copy of the whole graph, by returning the copy of the node you were handed.

A deep copy means a brand-new `Node` for every node of the original, with the same `val`, whose `neighbors` list holds the *copies* of the original's neighbours, in the same order. No node of your copy may be an original node, and the original graph must be left exactly as it was.

The tests describe a graph with `n` nodes as an adjacency list `adjList`. The nodes have values `1` to `n`, and `adjList[i]` lists the values of node `i + 1`'s neighbours, in order. Your function receives the node with value `1`, or `None` when the graph is empty, in which case you return `None`. Your copy is read back into an adjacency list the same way, so the expected output always equals the input. The checker also makes sure that every node it reaches in your copy is new, and that the original graph wasn't changed.

## Examples

**Example 1**

```
adjList = [[2,3],[1,3,4],[1,2],[2]]   -> [[2,3],[1,3,4],[1,2],[2]]
```

A triangle `1 – 2 – 3`, with node `4` hanging off node `2`. Following neighbours from node `1` leads back to node `1`, so the copy has to remember what it has already copied.

**Example 2**

```
adjList = [[3,2,4],[1],[1],[1]]   -> [[3,2,4],[1],[1],[1]]
```

Node `1` lists its neighbours as `3, 2, 4`, and its copy must list their copies in that same order.

**Example 3**

```
adjList = [[2],[1]]   -> [[2],[1]]
```

Two nodes, each the other's only neighbour. The copy of `1` points at the copy of `2`, which points back at the copy of `1`.

## Constraints

- `0 <= n <= 100`
- Node `i + 1` has value `i + 1`, so all values are distinct.
- No node is its own neighbour, and no edge is listed twice.
- Edges are undirected: `b` is in `adjList[a - 1]` exactly when `a` is in `adjList[b - 1]`.
- The graph is connected: every node can be reached from node `1`.

## Aim for

One traversal, DFS or BFS, with a hash map from each original node to its copy. The map does two jobs: it's the visited set, and it's how an edge back to an already-copied node finds that copy instead of making a second one, which is exactly what cycles need. Create a node's copy and put it in the map *before* following its neighbours. `O(V + E)` time, `O(V)` extra space.

## Follow-ups

- Write the other traversal (BFS if you used DFS). What would recursion depth cost on a path of `10^5` nodes?
- The graph may be disconnected, and you're given a list of all its nodes. What changes?
- Copy a linked list whose nodes also carry a `random` pointer to any node in the list. Which part of this solution carries over?
