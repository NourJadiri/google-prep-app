# Pascal's Triangle

## The task

Return the first `numRows` rows of Pascal's triangle, top row first, as a list of lists of integers.

The triangle is built one row at a time. Number the rows from `0`:

- Row `0` is `[1]`.
- Row `i` has `i + 1` numbers. Its first and last numbers are `1`. If `above` is row `i - 1`, every number in between is the sum of the two numbers just above it: position `j` holds `above[j - 1] + above[j]`, for each `j` from `1` to `i - 1`.

So the answer is rows `0` through `numRows - 1`.

## Examples

**Example 1**

```
numRows = 4   -> [[1],[1,1],[1,2,1],[1,3,3,1]]
```

In the last row, `3 = 1 + 2` and `3 = 2 + 1`: each inner number is the sum of the two numbers above it.

**Example 2**

```
numRows = 2   -> [[1],[1,1]]
```

Row 1 is just its two ends. There's nothing in between to add up yet.

**Example 3**

```
numRows = 6   -> [[1],[1,1],[1,2,1],[1,3,3,1],[1,4,6,4,1],[1,5,10,10,5,1]]
```

The numbers grow quickly, but the rule never changes: `10 = 4 + 6`.

## Constraints

- `1 <= numRows <= 30`

## Aim for

Each row is built entirely from the row above it, so you never need anything older: keep the previous row and grow the next one from it — a `1` at each end, sums of neighbouring pairs in between. This is dynamic programming at its gentlest: every new answer reuses answers you've already computed. `O(numRows^2)` time, which is also the size of the output.

## Follow-ups

- Return only row `k`, using `O(k)` extra space. Updating a single list in place works — but in which direction do you have to sweep it?
- Compute a single entry, say row 30, position 15, without building the triangle.
- Why do the numbers in row `i` add up to `2^i`?
