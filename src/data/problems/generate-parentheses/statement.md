# Generate Parentheses

## The task

Given `n`, return every string of `n` opening and `n` closing parentheses that is **balanced**: reading left to right, the number of `)` never gets ahead of the number of `(`, and the two counts end equal. Return the strings in any order.

## Examples

**Example 1**

```
n = 4   -> ["(((())))","((()()))","((())())","((()))()","(()(()))","(()()())","(()())()","(())(())","(())()()","()((()))","()(()())","()(())()","()()(())","()()()()"]
```

Fourteen balanced strings of length `8`.

**Example 2**

```
n = 2   -> ["(())","()()"]
```

`")(()"` has two of each but isn't balanced: it closes before anything is open.

## Constraints

- `1 <= n <= 10`

## Aim for

Build the string left to right and only ever make a legal move: add `(` while fewer than `n` have been opened, add `)` while fewer have been closed than opened. Choose, explore, un-choose. Every finished string is balanced, so nothing is built and thrown away. There are Catalan(`n`) answers, roughly `4^n / n^1.5`, each `O(n)` long, so `O(4^n / sqrt(n))` time. Generating all `2^(2n)` strings and filtering is the slow baseline: over a million candidates at `n = 10`, to keep 16,796.

## Follow-ups

- Only count them. Derive the Catalan recurrence from "where does the first `(` close?"
- Three bracket types, `()[]{}`, that must nest properly. What does the "may I close?" rule need now?
- Produce them in lexicographic order without sorting, then produce the `k`-th one directly.
