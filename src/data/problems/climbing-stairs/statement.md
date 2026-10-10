# Climbing Stairs

## The task

A staircase has `n` steps. You start on the floor at the bottom and want to finish standing on the top step, step `n`. Each move climbs either **1 step** or **2 steps**. Return the number of different sequences of moves that take you from the floor to exactly step `n`.

Two sequences are different if they differ anywhere: `1+2` and `2+1` are two different ways.

## Examples

**Example 1**

```
n = 4   -> 5
```

The five ways are `1+1+1+1`, `1+1+2`, `1+2+1`, `2+1+1` and `2+2`.

**Example 2**

```
n = 1   -> 1
```

A single step leaves room for only one move: a 1-step.

**Example 3**

```
n = 7   -> 21
```

Listing all 21 by hand is already tedious, and by 45 steps there are well over a billion. You'll want to count them without listing them.

## Constraints

- `1 <= n <= 45`

## Aim for

Ask yourself: what was the very last move, and where could you have been standing just before it? If you already knew the answers for shorter staircases, how would you combine them? That gives you a recursion — but a plain recursive version recomputes the same small staircases over and over and takes exponential time. Store each answer the first time you work it out (top-down, with a cache), or fill the answers in from the bottom up. Target `O(n)` time; `O(1)` space is possible.

## Follow-ups

- You may climb 1, 2 or 3 steps at a time — or any step size from a given list.
- Some steps are broken and can't be stood on.
- `n` can be as large as `10^18`, and you want the answer modulo `10^9 + 7`. (Think matrix powers: `O(log n)`.)
