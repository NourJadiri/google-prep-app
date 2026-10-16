## Approach

Pattern: a **dependency graph with a cache**, recomputed in **topological order**.

Start with what a cell stores:

- `terms`: the parsed formula, a list of referenced cells plus a constant. A plain number is a formula with no references.
- `value`: the cached number. This makes `get` a dictionary lookup.
- `reads`: the cells its formula references.
- `readers`: the cells whose formulas reference it.

The graph has an edge `A1 -> B1` when B1 reads A1. The `readers` sets are those edges. The `reads` sets are the same edges seen from the other end. You need both: `readers` to push updates forward, `reads` to unhook a formula when it is replaced.

`set(cell, value)` does four things:

1. **Find the affected cells.** Walk `readers` from `cell` (DFS or BFS). The result is the cell plus everything downstream of it.
2. **Check for a cycle.** If the new formula reads any affected cell, that cell would read `cell` while `cell` reads it. Reject and change nothing. This one walk does both jobs.
3. **Swap the edges.** Remove `cell` from the `readers` of every cell it used to read, then add it to the `readers` of every cell it reads now.
4. **Recompute in topological order.** Use Kahn's algorithm on the affected cells only. Count, for each affected cell, how many affected cells it reads. Start from `cell`, which waits on nobody. Recompute a cell, then decrement its readers' counts. A reader goes into the queue when its count hits zero, which means all its inputs are already up to date.

Why the order matters: in Example 1, A1's readers are B1 and C1. If C1 is recomputed before B1, it adds the old B1. Topological order makes every cell wait for all of its inputs.

## Complexity

`get`: `O(1)`.

`set`: `O(k + e)`, where `k` is the number of affected cells and `e` the edges between them. Parsing the formula adds `O(terms)`.

Space: `O(cells + references)`.

## Pitfalls

- Forgetting to remove the old edges. Values may still look right, but the stale edges fake cycles: B1 = `=A1`, then B1 = `5`, then A1 = `=B1` gets rejected for a loop that no longer exists.
- Pushing updates with plain recursion: recompute each reader, then recurse into it. It ends with the right values, but it recomputes a cell once per path to it. Stacked diamonds make that exponential.
- Modifying the graph before the cycle check. A rejected `set` must leave the sheet unchanged, so check first, then mutate.
- A formula reading its own cell, like `A1 = "=A1+1"`. It's a cycle of length one. The affected set contains `cell` itself, so the same check catches it.
