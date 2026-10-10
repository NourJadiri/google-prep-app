# Regular Expression Matching

## The task

Write a matcher for a tiny regular-expression language. A pattern `p` is built from:

- a lowercase letter, which matches exactly that letter
- `.`, which matches any single letter
- `*`, which means *zero or more copies* of the element right before it (a letter or `.`)

So `b*` matches `""`, `"b"`, `"bb"` and so on, and `.*` matches any string at all, including the empty one.

Return `true` if `p` matches the **whole** of `s`, and `false` otherwise. Matching only part of `s` doesn't count.

## Examples

**Example 1**

```
s = "abbbc", p = "ab*c"   -> true
```

`b*` takes the three `b`s.

**Example 2**

```
s = "ac", p = "ab*c"   -> true
```

`b*` takes zero `b`s.

**Example 3**

```
s = "abcd", p = "a.c"   -> false
```

`a.c` matches `"abc"`, but the `d` is left over.

## Constraints

- `1 <= s.length <= 20`
- `1 <= p.length <= 20`
- `s` contains only lowercase English letters.
- `p` contains only lowercase English letters, `.` and `*`.
- Every `*` comes right after a letter or a `.`.

## Aim for

`O(m·n)` time and space, with `m = len(s)` and `n = len(p)`. Let `match[i][j]` say whether `s[i:]` matches `p[j:]`. A starred element either matches nothing (`match[i][j+2]`) or takes `s[i]` and stays put (`match[i+1][j]`). Anything else must match `s[i]`, and then both indices move on. Plain backtracking is exponential on patterns like `a*a*a*…`, and memoising it gives the same `O(m·n)` bound.

## Follow-ups

- Add `+` (one or more copies) and `?` (zero or one). Which lines of the recurrence change?
- Wildcard matching: `?` matches one character and `*` matches any run on its own, not tied to the element before it. How does the DP change?
- Cut the memory to `O(n)`.
