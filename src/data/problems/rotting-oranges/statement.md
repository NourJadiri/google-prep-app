# Rotting Oranges

## The task

A crate of oranges is an `m x n` grid `grid`. Each cell is `0` (empty), `1` (a fresh orange) or `2` (a rotten orange). Every minute, each fresh orange that shares an edge (up, down, left or right) with a rotten orange turns rotten. All the oranges that turn in a given minute turn at the same moment, so an orange that turns this minute can only pass the rot on in the next minute.

Return the number of minutes until no fresh orange is left. Return `-1` if some fresh orange will never rot, and `0` if nothing is fresh to begin with.

## Examples

**Example 1**

```
grid = [[2,1,1,0,1],
        [1,0,1,1,1],
        [1,1,0,1,2]]   -> 3
```

Both rotten oranges spread at the same time. The last to turn are `[1,2]` and `[2,1]`, each three steps from its nearest rotten orange.

**Example 2**

```
grid = [[2,1,0,1]]   -> -1
```

The orange at the right end is cut off by an empty cell, so it stays fresh forever.

**Example 3**

```
grid = [[0,2,0]]   -> 0
```

Nothing is fresh, so no time has to pass.

## Constraints

- `m == grid.length`, `n == grid[i].length`
- `1 <= m, n <= 300`
- `grid[i][j]` is `0`, `1` or `2`

## Aim for

`O(m·n)` with a **multi-source BFS**. Put every rotten orange in the queue before you start. Then each round of the BFS is one minute: it rots the fresh neighbours of everything in the current ring. Count the fresh oranges up front and decrement the count as they turn, so the `-1` check is a single comparison, not another scan. Crates here go up to 300 x 300 (LeetCode stops at 10 x 10). At that size, rescanning the whole crate every minute, or running a separate BFS from each rotten orange, won't finish in time.

## Follow-ups

- Return the minute at which each orange rots, not just the last one.
- Some oranges are wrapped: they can't rot and can't pass rot along. What changes?
- Why does a DFS from each rotten orange give the wrong minutes, unless you keep revisiting cells?
