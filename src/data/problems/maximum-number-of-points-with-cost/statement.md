# Maximum Number of Points with Cost

## The task

You're given an `m × n` grid of non-negative integers, `points`. Pick exactly one cell in every row. Your score is the sum of the values you picked, minus a penalty for every pair of neighbouring rows: picking column `c1` in row `r` and column `c2` in row `r + 1` costs `|c1 - c2|` points.

Return the maximum score you can get.

## Examples

**Example 1**

```
points = [[5,1,1],[1,1,6],[2,8,1]]   -> 16
```

Pick the `5`, then the `6` (moving two columns costs 2), then the `8` (moving one column costs 1): `5 + 6 + 8 - 2 - 1 = 16`.

**Example 2**

```
points = [[9,0,0,0,0,8],[0,0,0,0,0,9]]   -> 17
```

Starting on the `9` costs 5 to reach the `9` below it: `9 + 9 - 5 = 13`. Starting on the `8` costs nothing: `8 + 9 = 17`.

**Example 3**

```
points = [[4,0,6]]   -> 6
```

With a single row there's no penalty, so take the largest value.

## Constraints

- `m == points.length`
- `n == points[r].length`
- `1 <= m, n <= 10^5`
- `1 <= m * n <= 10^5`
- `0 <= points[r][c] <= 10^5`

## Aim for

`O(m·n)` time and `O(n)` space. Going row by row, the best score ending in column `c` is `points[r][c] + max over k of (prev[k] - |k - c|)`. Trying every `k` is `O(m·n^2)`, hopeless when one row holds `10^5` cells. Instead, split on whether `k` is left or right of `c`. One sweep from the left carries the best `prev[k]`, losing one point per step; a sweep from the right does the same; each cell takes the larger of the two.

## Follow-ups

- Return the chosen columns as well as the score.
- The penalty becomes `w · |c1 - c2|` for a given weight `w`. What changes?
- The penalty becomes `(c1 - c2)^2`. Does a sweep still work?
