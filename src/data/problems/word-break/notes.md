## Approach

This is a **prefix DP** ("can I reach position `i`?"), and the reason it's needed is overlap. Plain backtracking picks a first word, recurses on the rest, and on failure tries the next first word. Different choices often leave the *same* suffix — `"a" + "aa"` and `"aa" + "a"` both leave `s[3:]` — and backtracking solves that suffix again every time. On `"aaa…ab"` the number of ways to carve up the a's grows exponentially, and every one of them fails at the `b`.

Everything a later decision needs to know is the position of the last cut, so make the position the state.

- **Subproblem:** `dp[i]` is `True` when the prefix `s[:i]` can be split into dictionary words.
- **Recurrence:** look at the last piece of such a split. It's some word ending exactly at `i`, and what precedes it must split cleanly on its own. So `dp[i]` is true iff, for some word length `L <= i`, both `dp[i - L]` and `s[i - L:i] in words` hold.
- **Base case:** `dp[0] = True` — the empty prefix needs no words. Without it nothing can ever become true.
- **Fill order:** `i` from `1` to `n`, since `dp[i]` reads only smaller indices. The answer is `dp[n]`.

Correctness is the recurrence itself: every clean split of `s[:i]` has a last word, and removing it leaves a clean split of a shorter prefix; conversely, a cleanly split shorter prefix plus one word that fills the gap is a clean split of `s[:i]`.

Two engineering choices keep it fast: the words live in a set (constant-time membership), and the inner loop runs over the *distinct word lengths* — at most 20 here — rather than over all 1,000 words or every earlier split point. Stopping the inner loop as soon as `dp[i]` turns true is a free bonus.

**Top-down** is the same recurrence read from the other end: `can(i)` means "the suffix `s[i:]` splits cleanly", with `can(n) = True` and `can(i)` true when some word matches at `i` and `can(i + len(word))` holds. With `@cache` each position is solved once; the recursion is at most `n` deep.

The graph view is worth keeping in your pocket too: positions `0..n` are nodes, and every word that matches at `i` is an edge to `i + len(word)`. The question is whether `n` is reachable from `0`, and BFS with a visited set has the same complexity as the table.

## Complexity

`O(n · K)` substring checks, where `K <= 20` is the number of distinct word lengths. Each check hashes a slice of at most `L` = 20 characters, so the character work is `O(n · L^2)` at worst — tiny at `n = 300`. Building the set costs the dictionary's total length. Extra space is `O(n)` for the table, plus the set.

## Pitfalls

- Greedy in either direction. Longest-first fails on `"carpetsale"` (`"carpet"` strands `"sale"`); shortest-first fails on `"aaab"` with `["a","aab"]`.
- Forgetting `dp[0] = True`, or returning `dp[n - 1]` instead of `dp[n]`.
- Python's negative indices hide bugs: `dp[i - L]` with `L > i` quietly reads from the far end of the table instead of failing. Only try lengths `L <= i`.
- Memoising on the remaining *string* works, but slices a copy on every call. Memoise on the index.
