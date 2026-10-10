# Cherry Pickup II

## The task

An orchard is a `rows × cols` grid, and `grid[r][c]` is the number of cherries in that cell. Two robots start in the top row: robot A in the top-left corner `(0, 0)` and robot B in the top-right corner `(0, cols - 1)`.

Both robots move at the same time, one row down per step, until they reach the bottom row. From `(r, c)` a robot moves to `(r + 1, c - 1)`, `(r + 1, c)` or `(r + 1, c + 1)`, and it can never leave the grid. A robot picks every cherry in each cell it visits, including its starting cell. If both robots are in the same cell at the same time, the cherries there are collected only once.

Return the largest total number of cherries the two robots can collect.

## Examples

**Example 1**

```
grid = [[3,1,1,2],[2,5,0,1],[1,1,4,6]]   -> 21
```

A picks `3 → 5 → 4` and B picks `2 → 1 → 6`.

**Example 2**

```
grid = [[1,0,1],[0,9,0],[2,0,2]]   -> 15
```

Both robots can reach the `9`, but only one of them gets it: A picks `1 → 0 → 2` and B picks `1 → 9 → 2`. Counting the `9` twice would give `24`.

**Example 3**

```
grid = [[5,7],[3,9]]   -> 24
```

The smallest orchard: A takes `5 → 3` and B takes `7 → 9`.

## Constraints

- `rows == grid.length`
- `cols == grid[i].length`
- `2 <= rows, cols <= 70`
- `0 <= grid[i][j] <= 100`

## Aim for

`O(rows · cols^2)` time (times 9 for the pairs of moves) and `O(cols^2)` space. The robots move in lockstep, so a state is the row plus *both* columns: `dp[a][b]` = the most cherries collected with A in column `a` and B in column `b`, one layer per row, each layer built from the previous one over the 9 move combinations. Planning one robot and then the other doesn't work.

## Follow-ups

- Return the two routes as well as the total.
- Three robots. What's the state now, and what does it cost?
- The original Cherry Pickup: one robot walks from the top-left to the bottom-right and back, and picked cells stay empty. How does that become two robots moving together?
