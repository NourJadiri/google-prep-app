# N-Queens

## The task

Place `n` queens on an `n × n` chessboard so that no two attack each other: no two may share a row, a column, or a diagonal (in either direction). Return every such placement.

Draw each placement as `n` strings, one per row from top to bottom, using `'Q'` for a queen and `'.'` for an empty square. The placements can come in any order.

## Examples

**Example 1**

```
n = 6   -> [[".Q....","...Q..",".....Q","Q.....","..Q...","....Q."],["..Q...",".....Q",".Q....","....Q.","Q.....","...Q.."],["...Q..","Q.....","....Q.",".Q....",".....Q","..Q..."],["....Q.","..Q...","Q.....",".....Q","...Q..",".Q...."]]
```

A `6 × 6` board has only four placements, fewer than the ten of a `5 × 5` board.

**Example 2**

```
n = 3   -> []
```

Wherever the middle row's queen goes, the top and bottom rows can't both be filled safely.

## Constraints

- `1 <= n <= 10`

## Aim for

Place one queen per row, top to bottom. In row `r`, try each column `c` that is still safe: choose it, explore row `r + 1`, un-choose. "Safe" must be an `O(1)` test, so keep three sets: used columns, used `r - c` diagonals and used `r + c` anti-diagonals. That pruning is the whole game. At `n = 10` it visits about 35,000 partial boards, where generating all `10!` (3.6 million) column orders and filtering them is far too slow.

## Follow-ups

- Return only the number of placements (N-Queens II). Replace the sets with bitmasks.
- Use the board's mirror symmetry to cut the work in half. What needs care when `n` is odd?
- Produce just one placement for `n = 1000`. Backtracking won't get there; what will?
