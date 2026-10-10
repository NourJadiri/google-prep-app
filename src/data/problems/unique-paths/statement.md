# Unique Paths

## The task

A robot starts in the top-left cell of a grid with `m` rows and `n` columns and wants to reach the bottom-right cell. Each move takes it one cell **right** or one cell **down** — never left, never up, never off the grid. Return the number of different routes it can take.

Two routes are different when their sequences of moves differ. On a `1 × 1` grid the robot is already at the goal, and that counts as one route (the one with no moves).

## Examples

**Example 1**

```
m = 4, n = 4   -> 20
```

Every route makes exactly 3 moves down and 3 moves right; routes differ only in the order of those moves.

**Example 2**

```
m = 2, n = 5   -> 5
```

With two rows, a route is fixed by the column where the robot steps down: five choices.

**Example 3**

```
m = 1, n = 9   -> 1
```

A single row leaves one route: straight right.

## Constraints

- `1 <= m, n <= 100`
- The tests keep the answer at most `2 * 10^9`.

## Aim for

A cell can only be entered from above or from the left, so the routes into `(r, c)` are the routes into `(r - 1, c)` plus the routes into `(r, c - 1)`, and the top row and left column have exactly one route each. Fill row by row in `O(m · n)` time. Each row reads only the row above, so one array of `n` counts is all the memory you need — update it in place, left to right. Bonus points for the closed form, a single binomial coefficient.

## Follow-ups

- Some cells are blocked (Unique Paths II). What happens to the base cases?
- The robot may also move diagonally, down and right in one step.
- Compute the binomial coefficient exactly in a language with 64-bit integers, without overflowing along the way.
