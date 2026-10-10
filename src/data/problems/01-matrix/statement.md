# 01 Matrix

## The task

You're given an `m x n` matrix `mat` of `0`s and `1`s. For every cell, find its distance to the nearest `0`. One step moves to an edge-adjacent cell (up, down, left or right), and a `0` is at distance 0 from itself. Return a matrix of the same shape holding those distances.

`mat` contains at least one `0`.

## Examples

**Example 1**

```
mat = [[1,1,0,1],
       [1,1,1,1],
       [0,1,1,1]]   -> [[2,1,0,1],[1,2,1,2],[0,1,2,3]]
```

Each cell takes whichever `0` is closer. `[1,3]` is two steps from the `0` at `[0,2]` and four steps from the one at `[2,0]`, so its answer is 2.

**Example 2**

```
mat = [[1,1,1,0,1]]   -> [[3,2,1,0,1]]
```

**Example 3**

```
mat = [[0]]   -> [[0]]
```

## Constraints

- `m == mat.length`, `n == mat[i].length`
- `1 <= m, n <= 10^4`
- `1 <= m * n <= 10^4`
- `mat[i][j]` is `0` or `1`
- `mat` contains at least one `0`.

## Aim for

A separate BFS from each `1` costs `O((m·n)^2)`. Flip it around: run **one** BFS that starts from every `0` at the same time (a multi-source BFS). Cells leave the queue in order of distance, so a cell's first visit fixes its answer. `O(m·n)` time and space. Two dynamic-programming sweeps (top-left to bottom-right, then back) also work and are worth knowing.

## Follow-ups

- Do it with no queue: two passes over the matrix. Why are two passes enough?
- Some cells become walls you can't walk through. Which approach still works?
- Diagonal steps count as one step too. What changes?
