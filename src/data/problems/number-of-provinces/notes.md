## Approach

Read the matrix as a graph — a city is a node, a `1` is an edge — and a province is a **connected component**. The answer is the number of components.

**Union-find** (disjoint-set union) counts them one road at a time. Every city starts as its own group and a counter starts at `n`. For each road `(i, j)` — only above the diagonal, since the matrix is symmetric — find the root of each city's group. Different roots: the road joins two provinces, so hang one root under the other and decrement the counter. Same root: the road runs inside a province you've already counted, and nothing changes.

Why it's right: after any prefix of the roads, the groups are exactly the components of the graph built from those roads, and the counter equals the number of groups. A road either merges two components (one fewer) or connects two cities that were already connected (no change), so the invariant survives every step.

`find` walks parent pointers to the root. **Path halving** (`parent[x] = parent[parent[x]]` on the way up) flattens the trees as it goes, so later finds are short; add union by size and every operation is effectively constant time.

**The flood-fill alternative** is just as good here: keep a `visited` array, and for each unvisited city start a DFS or BFS that marks everything it reaches; the number of floods is the answer. Each flood scans the full matrix row of every city it visits — `O(n^2)` overall — and a recursive DFS goes at most `n` deep.

Which to pick? For a static map they tie, and DFS is less code. Union-find wins when roads arrive one at a time: the counter is correct after every union, with no re-flooding (that's Number of Islands II).

## Complexity

`O(n^2)` time: every entry above the diagonal is read once, and each `find` is near-constant amortised thanks to path compression. `O(n)` extra space for `parent` (or for `visited` and the DFS stack).

## Pitfalls

- Decrementing the counter for every road, even when both cities already share a root. A triangle of roads then subtracts three instead of two, and a dense map can go negative.
- Writing `parent[i] = j` instead of `parent[find(i)] = find(j)`. Overwriting a city's own parent cuts it out of the group it already joined.
- Counting cities, or rows, that have a direct road. Indirect connections are the whole point: in a chain the two ends share a province without sharing a road.
