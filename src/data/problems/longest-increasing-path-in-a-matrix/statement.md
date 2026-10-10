# Longest Increasing Path in a Matrix

## The task

Given an `m x n` matrix of integers `matrix`, return the length of its longest increasing path. A path moves from a cell to an edge-adjacent cell (up, down, left or right; no diagonals, and no wrapping around the edges). It is increasing when every step lands on a strictly larger value. Its length is the number of cells it visits, so a single cell is a path of length 1.

## Examples

**Example 1**

```
matrix = [[5,4,8],
          [6,1,9],
          [7,2,3]]   -> 5
```

`1 → 4 → 5 → 6 → 7`: up, left, then down the left column. The rival `1 → 2 → 3 → 9` is only 4 cells long.

**Example 2**

```
matrix = [[2,2],
          [2,2]]   -> 1
```

Equal neighbours don't count as increasing. No step is possible, so every path is a single cell.

**Example 3**

```
matrix = [[9,8,7,1,2]]   -> 4
```

`1 → 7 → 8 → 9`, read right to left. Paths can head in any direction.

## Constraints

- `m == matrix.length`, `n == matrix[i].length`
- `1 <= m, n <= 200`
- `0 <= matrix[i][j] <= 2^31 - 1`

## Aim for

`O(m·n)`. Every step goes strictly uphill, so a path can never revisit a cell: the cells and their uphill steps form a DAG. That makes "the longest path starting here" a fixed number for each cell. Compute it with a memoised DFS, where a cell's answer is 1 plus the best answer among its larger neighbours. No visited set is needed. Alternatively, peel the DAG with Kahn's algorithm: start with the cells that have no smaller neighbour and work layer by layer. The number of layers is the answer.

## Follow-ups

- Return the path itself, not just its length.
- Allow steps onto equal values too. Why does the memo break, and what problem are you solving now?
- Solve it without recursion.
