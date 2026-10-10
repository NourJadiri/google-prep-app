# The K Weakest Rows in a Matrix

## The task

You're given an `m x n` grid `mat` of `1`s (soldiers) and `0`s (civilians). In every row, all the soldiers stand in front of all the civilians: each row is some `1`s followed by some `0`s.

Row `i` is **weaker** than row `j` if it has fewer soldiers, or if both rows have the same number of soldiers and `i < j`.

Return the indices of the `k` weakest rows, weakest first.

## Examples

**Example 1**

```
mat = [[1,1,0],[1,0,0],[1,1,1],[0,0,0]], k = 2   -> [3,1]
```

The rows have `2, 1, 3, 0` soldiers. The weakest is row `3` with none, then row `1`.

**Example 2**

```
mat = [[1,0],[1,0],[1,1],[1,0]], k = 3   -> [0,1,3]
```

Rows `0`, `1` and `3` each have one soldier, so they go in index order.

**Example 3**

```
mat = [[1,1,1,1],[1,1,1,0],[1,1,1,1]], k = 2   -> [1,0]
```

A row can be all soldiers. Rows `0` and `2` both have four, and the smaller index comes first.

## Constraints

- `m == mat.length`, `n == mat[i].length`
- `2 <= m, n <= 100`
- `1 <= k <= m`
- `mat[i][j]` is `0` or `1`, and in every row the `1`s come before the `0`s.

## Aim for

Give every row a single sort key that captures the whole rule: fewer soldiers first and, on a tie, the smaller index. How do Python tuples compare? Once every row has its key, sorting — or a heap that keeps the `k` smallest — finishes the job. And because the soldiers stand at the front, can you count them without looking at every cell?

## Follow-ups

- Count each row's soldiers in `O(log n)` with binary search.
- Keep a heap of only `k` rows while you scan, for `O(m log k)` instead of sorting all `m` rows.
- Scan the grid column by column from the left instead. In what order do the rows run out of soldiers?
