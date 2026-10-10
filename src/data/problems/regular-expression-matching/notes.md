## Approach

**Subproblem.** `match[i][j]` = whether the suffix `s[i:]` matches the suffix `p[j:]`. Suffixes are the convenient direction because a `*` modifies the element *before* it: standing at `p[j]`, peek at `p[j+1]` to see whether `p[j]` is starred.

**Recurrence.** Let `first = i < m and p[j] in (s[i], '.')`, i.e. whether `p[j]` can match the next character of `s`.

- If `p[j+1] == '*'`, the pair `p[j]*` can match zero characters, so skip the pair: `match[i][j+2]`. Or it can match `s[i]` and **stay on the same pair** for more: `first and match[i+1][j]`. Staying on `j` is what lets a single star absorb any number of characters without enumerating counts.
- Otherwise `p[j]` must match exactly one character: `first and match[i+1][j+1]`.

**Base cases.** `match[m][n] = true`, since both are empty. `match[i][n] = false` for `i < m`: the pattern is used up with letters left over. `match[m][j]` follows from the same rules: with `s` used up, `first` is false, so it's true exactly when `p[j:]` is a run of starred pairs.

**Fill order.** `i` from `m` down to `0`, and `j` from `n - 1` down to `0`. Every entry reads row `i` at a larger `j`, or row `i + 1`. The answer is `match[0][0]`.

**Why backtracking blows up.** Without a memo, every starred element tries "skip" and "take one more" at every step. Against `s = "aaa…ab"` and `p = "a*a*a*…"`, the number of ways to share the `a`s among the stars grows combinatorially, and because the match fails in the end, every way gets tried. Yet there are only `(m+1)(n+1)` distinct `(i, j)` pairs.

**Top-down.** The backtracking recursion `match(i, j)` with `@cache` on `(i, j)` is the same DP filled lazily. It's often the quickest version to write in an interview, and it recurses at most `m + n` calls deep.

**Space.** Row `i` reads only rows `i` and `i + 1`, so two rows of `n + 1` booleans are enough: `O(n)`.

## Complexity

`O(m·n)` time: each of the `(m+1)(n+1)` entries is a constant amount of work. `O(m·n)` space for the table, or `O(n)` with two rows.

## Pitfalls

- Matching greedily, letting `x*` take everything it can. `"aaa"` against `"a*a"` needs the star to leave one `a` behind.
- Forgetting zero copies: `"ab*c"` must match `"ac"`, and `"a*b*"` matches an empty remainder.
- Accepting a partial match. `"a.c"` against `"abcd"` is `false`.
- Treating `*` as an element of its own instead of a modifier of the one before it.
