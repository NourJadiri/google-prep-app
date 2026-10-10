## Approach

**The pattern: build each answer from answers you already have.** Pascal's triangle is dynamic programming in its simplest form: the table *is* the answer, and every entry is computed from entries above it that are already filled in. In the usual DP vocabulary:

- **State:** the number at position `j` of row `i`.
- **Recurrence:** it's the sum of the two numbers above it — positions `j - 1` and `j` of row `i - 1`.
- **Base cases:** the edges. Row `0` is `[1]`, and every row starts and ends with `1`, since those positions have only one number above them.

Because row `i` only ever looks at row `i - 1`, you can build the rows top to bottom, and each one is finished by the time the next one needs it.

**Mechanics.** Start with `rows = [[1]]`. Then, `numRows - 1` times: take `above = rows[-1]`, compute the pair sums `above[j - 1] + above[j]` for `j` from `1` to `len(above) - 1`, and append `[1] + sums + [1]`. When `above` is `[1]` there are no pairs to sum, so the next row comes out as `[1, 1]` with no special case needed. Another neat way to write the pair sums is `[a + b for a, b in zip(above, above[1:])]`, which pairs each number with its right-hand neighbour.

**Why it's correct.** The rows are produced in exactly the order the definition needs: row `i` is built only from a finished row `i - 1`, its ends are set to `1`, and each inner position is set to the sum of the two numbers above it.

**What the numbers mean.** Position `j` of row `i` counts the ways to choose `j` things out of `i` — the binomial coefficient `C(i, j)`. It also counts the paths from the top of the triangle down to that spot, moving down-left or down-right at each row. The recurrence says "a path to here arrived from the upper-left or from the upper-right": the same last-move argument as Climbing Stairs.

**Spotting it next time.** A table where each cell depends on nearby cells in the previous row (or column) — counting paths through a grid, edit distance, longest common subsequence. Fill it in an order that respects those dependencies, and when each row needs only the row before it, keep just that one row.

## Complexity

`O(numRows^2)` time: row `i` takes `O(i)` work, and `1 + 2 + … + numRows` is about `numRows^2 / 2`. The output holds that many numbers, so you can't do better. Beyond the output itself, the extra space is just the row being built.

## Pitfalls

- Appending the same list object every time. If you update one `row` list in place and call `rows.append(row)` after each step, every entry of the answer *is* that one list, so they all show the final row. Append a new list each time (or a copy, `row[:]`).
- Getting `numRows = 1` wrong because the triangle was seeded with `[[1], [1, 1]]`.
- An off-by-one in the inner range. Row `i` has `i - 1` inner numbers; with `above` of length `i`, `j` runs from `1` to `len(above) - 1`.
