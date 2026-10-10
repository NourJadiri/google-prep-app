# Shortest Path in Binary Matrix

## The task

`grid` is an `n x n` matrix of `0`s (open cells) and `1`s (blocked cells). A clear path runs from the top-left cell `[0, 0]` to the bottom-right cell `[n - 1, n - 1]` through open cells only. Each step moves to one of the up to eight surrounding cells, meaning any cell that shares an edge or a corner with the current one.

A path's length is the number of cells on it, counting both ends. Return the length of the shortest clear path, or `-1` if there is none. In particular, the answer is `-1` whenever the start or the goal is blocked.

## Examples

**Example 1**

```
grid = [[0,1,1,0,0],
        [0,1,0,1,0],
        [0,0,1,1,0],
        [1,1,0,1,0],
        [0,0,0,1,0]]   -> 9
```

The shortest route is `[0,0] → [1,0] → [2,1] → [1,2] → [0,3] → [1,4] → [2,4] → [3,4] → [4,4]`. It climbs back up to the top row, and the step from `[2,1]` to `[1,2]` slips diagonally between two blocked cells, which is allowed.

**Example 2**

```
grid = [[1,0],
        [0,0]]   -> -1
```

The start itself is blocked.

**Example 3**

```
grid = [[0]]   -> 1
```

The start is the goal: a path of one cell.

## Constraints

- `n == grid.length == grid[i].length`
- `1 <= n <= 100`
- `grid[i][j]` is `0` or `1`

## Aim for

BFS from `[0, 0]` in all eight directions. Every step costs the same, so BFS layers are path lengths, and the first time the goal leaves the queue you have the shortest length. Mark a cell as visited when you push it. `O(n^2)` time and space. A DFS finds *a* path, not necessarily the shortest one.

## Follow-ups

- Return the path itself, not just its length.
- Diagonal steps cost `√2` instead of 1. What replaces BFS?
- Would A* help here, using the Chebyshev distance to the goal as the heuristic? When?
