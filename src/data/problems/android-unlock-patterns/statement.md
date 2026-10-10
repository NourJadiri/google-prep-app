# Android Unlock Patterns

Stands in for LeetCode 351 (premium). Original statement written for this app — same task, own words and examples.

## The task

A lock screen shows nine dots in a 3×3 grid, numbered:

```
1 2 3
4 5 6
7 8 9
```

A pattern is a sequence of **distinct** dots traced without lifting your finger. One legality rule: whenever the straight line between two consecutive dots passes **through the centre of a third dot**, that dot must already have been used. (Passing over an already-used dot is fine.) So `1 -> 3` is illegal while `2` is fresh, but in `2 -> 1 -> 3` the last move is legal because `2` is used by then. Knight-ish moves like `1 -> 6` or `2 -> 9` cross no dot centre and are always fine.

Given `m` and `n`, count how many valid patterns use at least `m` and at most `n` dots. Implement `numberOfPatterns(m, n)`, returning that count.

## Examples

**Example 1**

```
m = 1, n = 1   -> 9
```

Nine single-dot patterns.

**Example 2**

```
m = 1, n = 2   -> 65
```

9 singles + 56 pairs: of the 9×8 = 72 ordered pairs, 16 are blocked jumps — `1-3, 4-6, 7-9, 1-7, 2-8, 3-9, 1-9, 3-7` and their reverses — all crossing an unused middle dot.

**Example 3**

```
m = 4, n = 9   -> 389112
```

Every pattern a real phone accepts (they insist on at least four dots). A good self-check for your final code.

## Constraints

- `1 <= m <= n <= 9`

## Aim for

Backtracking — the day-2 skeleton with one twist: a `skip[a][b]` table naming the dot a move jumps over (`skip[1][3] = 2`, `skip[1][9] = 5`, …), checked against the used-set before recursing. Then the symmetry cut: corners are interchangeable, edges are interchangeable — count from `1` and `2` once each, multiply by 4, add the runs from `5`. Bring up the symmetry unprompted; it's the difference between a pass and a strong pass.

## Follow-ups

- Exactly why is 4×(corner) + 4×(edge) + centre valid? What property of the board is doing the work?
- Count patterns that use *every* dot — what collapses out of your code?
- The rule table vs. computing "does this segment cross a dot" geometrically: trade-offs?
