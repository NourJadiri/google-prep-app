## Approach

**Say the simple version first.** Build a cleaned list of the characters that count — `[c.lower() for c in s if c.isalnum()]` — and check whether it equals its own reverse. In Python, `isalnum()` asks "is this a letter or a digit?" and `lower()` takes care of case. It's correct and `O(n)`, but the cleaned copy costs `O(n)` extra memory.

**The pattern: two pointers walking inward.** A palindrome mirrors around its middle: the first character that counts must match the last one that counts, the second must match the second-to-last, and so on. So you never need the copy. Put one index `i` at the start and one index `j` at the end, and on each round do exactly one of these:

- `s[i]` isn't a letter or digit: skip it with `i += 1`.
- Otherwise, if `s[j]` isn't a letter or digit: skip it with `j -= 1`.
- Otherwise compare the two ignoring case. If they differ, return `False` immediately. If they match, step both pointers inward.

When the pointers meet or cross, every pair has matched, so return `True`. A string with nothing to compare (only symbols) never finds a mismatch, so it correctly comes out `True` as well.

Why is that `O(n)`? Every round moves at least one pointer one step closer to the other, and they start `n - 1` apart, so there are fewer than `n` rounds. And no copy is built, so the extra space is just the two indices.

Doing one thing per round (the `if` / `elif` chain) keeps the logic simple: a run of several symbols just takes several rounds to skip.

**Spotting it next time:** anything about mirrors or "comparing from both ends" — palindromes, reversing a list in place, finding a pair in a *sorted* array that adds up to a target — is a job for two pointers starting at opposite ends and moving toward each other.

## Complexity

Two pointers: `O(n)` time, since each character is visited at most once by one of the pointers. `O(1)` extra space.

Cleaned copy: also `O(n)` time, but `O(n)` extra space for the copy and its reverse.

## Pitfalls

- Dropping the digits. `isalpha()` keeps letters only, so `"1a2"` would be cleaned to `"a"` and called a palindrome. Use `isalnum()`.
- Cleaning with the regular expression `\W`. It removes non-"word" characters, but underscores count as word characters, so `"ab_a"` stays `"ab_a"` instead of becoming `"aba"`.
- Skipping with two separate `if`s and then comparing in the same round. With two symbols in a row, as in `"a..ba"`, the second `.` gets compared with the `b`.
