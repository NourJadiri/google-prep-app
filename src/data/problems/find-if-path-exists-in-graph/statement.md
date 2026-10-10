# Find if Path Exists in Graph

## The task

A data centre has `n` machines, numbered `0` to `n - 1`, wired together by cables. `edges[i] = [u, v]` means one cable joins machines `u` and `v`, and a cable carries messages in both directions. Return `True` if a message sent from machine `source` can reach machine `destination` by hopping along cables — directly or through any number of other machines — and `False` otherwise.

A machine can always reach itself, so when `source == destination` the answer is `True`. No cable joins a machine to itself, and no pair of machines is joined twice.

In graph terms, the machines are nodes, the cables are undirected edges, and the question is whether `source` and `destination` lie in the same connected piece of the graph.

## Examples

**Example 1**

```
n = 6, edges = [[1,0],[2,1],[3,4],[5,2]], source = 0, destination = 5   -> true
```

The route is `0 → 1 → 2 → 5`. Every cable on it happens to be listed "backwards" (`[1,0]` rather than `[0,1]`), which doesn't matter: cables work both ways.

**Example 2**

```
n = 5, edges = [[0,1],[1,2],[3,4]], source = 0, destination = 4   -> false
```

Machines `0`, `1` and `2` are wired to each other, and so are `3` and `4`, but no cable links the two groups.

**Example 3**

```
n = 3, edges = [], source = 1, destination = 1   -> true
```

There are no cables at all, but the message is already where it needs to be.

## Constraints

- `1 <= n <= 2 * 10^5`
- `0 <= edges.length <= 2 * 10^5`
- `edges[i].length == 2`
- `0 <= u, v <= n - 1`, `u != v`
- No pair of machines appears in `edges` more than once, in either order.
- `0 <= source, destination <= n - 1`

## Aim for

First turn the cable list into an adjacency list: for each machine, the machines it's directly wired to (record every cable from both ends). Then explore outward from `source` — breadth-first with a queue, or depth-first with a stack — marking each machine as seen so it's never processed twice, and stop the moment you reach `destination`. `O(n + E)` time and space, where `E` is the number of cables. Union-find is a neat alternative once you've written the search.

## Follow-ups

- Return the fewest hops from `source` to `destination`, or `-1`. Which of BFS and DFS gives you that for free, and why?
- Thousands of `(source, destination)` questions arrive for the same network. How do you answer each in about `O(1)`?
- The cables become one-way. What changes in your search — and does union-find still work?
