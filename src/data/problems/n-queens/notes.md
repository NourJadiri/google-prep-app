## Approach

Two queens in the same row attack each other, so a solution has exactly one queen per row. Place them row by row; in row `r` the choices are the columns.

```
place(r):
    if r == n:
        record the board
        return
    for c in range(n):
        if c in cols or r - c in diag or r + c in anti:
            continue                                   # prune: square attacked
        mark c, r - c, r + c; queens.append(c)          # choose
        place(r + 1)                                    # explore
        unmark c, r - c, r + c; queens.pop()            # un-choose
```

**The diagonal trick.** Squares on one `\` diagonal share the value `r - c`; squares on one `/` diagonal share `r + c`. So three sets answer "is this square attacked?" in `O(1)`, and placing or lifting a queen is three set operations. Rows need no set at all, since the recursion uses each row once.

**Why the pruning matters.** Generating every column order (`n!` of them) and testing each one would examine 3.6 million boards at `n = 10`. Testing safety *before* recursing cuts a branch the moment a conflict appears, and the search touches only about 35,000 partial boards.

Correctness: every solution has one queen per row, so it is one sequence of column choices; the loop offers every column and skips only attacked squares, which can't be part of any solution. So every solution is reached, and each exactly once.

Keep the queens as `queens[r] = c` while searching and draw the strings only when a placement is complete. That keeps the un-choose step to a `pop` and three set removals, with no board to repair.

## Complexity

There is no neat closed form for the size of the search. `O(n!)` is the honest upper bound: at most `n` choices in the first row, at most `n - 1` safe columns in the next, and so on, and the diagonal pruning does far better in practice. Drawing a solution costs `O(n^2)`. Extra space is `O(n)` for the sets, the queens and the recursion.

For counting only (N-Queens II), swap the sets for three bitmasks: `free = ~(cols | left | right) & full` holds every safe column at once, `free & -free` picks the lowest, and the diagonal masks shift by one bit per row.

## Pitfalls

- Guarding only one diagonal direction: `r - c` catches `\`; `/` needs `r + c`.
- Forgetting to remove all three marks on the way back.
- Keeping a mutable grid (a list of character lists) and recording it without copying: every recorded board ends up showing the grid's final state.
