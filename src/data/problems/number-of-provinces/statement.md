# Number of Provinces

## The task

A country has `n` cities, numbered `0` to `n - 1`, and a road map given as an `n x n` matrix `isConnected`: `isConnected[i][j] == 1` means a road runs directly between city `i` and city `j`, and `0` means it doesn't. Roads go both ways, so the matrix is symmetric, and its diagonal is all `1`s (a city trivially reaches itself).

Two cities belong to the same province if you can drive from one to the other — directly, or through any number of cities in between. A province is a group of cities that can all reach one another and can't reach any city outside the group. Return how many provinces there are.

## Examples

**Example 1**

```
isConnected = [[1,0,0,1,0],[0,1,1,0,0],[0,1,1,0,0],[1,0,0,1,1],[0,0,0,1,1]]   -> 2
```

Roads `0–3`, `3–4` and `1–2`. City `0` has no road to `4`, but reaches it through `3`, so the provinces are `{0, 3, 4}` and `{1, 2}`.

**Example 2**

```
isConnected = [[1,1,0,0],[1,1,1,0],[0,1,1,1],[0,0,1,1]]   -> 1
```

A chain `0–1–2–3`: the two ends never meet directly, yet everything is one province.

**Example 3**

```
isConnected = [[1,0,0],[0,1,0],[0,0,1]]   -> 3
```

No roads at all: every city is a province of its own.

## Constraints

- `1 <= n <= 200`
- `isConnected.length == n` and `isConnected[i].length == n`
- `isConnected[i][j]` is `0` or `1`
- `isConnected[i][i] == 1`
- `isConnected[i][j] == isConnected[j][i]`

## Aim for

It's connected components on an adjacency matrix. Either flood from every unvisited city with DFS or BFS and count the floods, or run union-find over the `1`s above the diagonal with a counter that starts at `n` and drops only when a union merges two different groups. Reading the matrix already costs `O(n^2)`, so that's the target, with `O(n)` extra space.

## Follow-ups

- Roads open one at a time and you must report the province count after each. Which of the two approaches still fits, and why?
- The map arrives as an edge list for `10^5` cities instead of a matrix. What does each approach cost now?
- Roads can also close. Why does union-find struggle with that, and what would you do instead?
