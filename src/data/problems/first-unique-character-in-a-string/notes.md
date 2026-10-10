## Approach

**The pattern: count first, then look.** "Appears exactly once" is a fact about the *whole* string, so you can't settle it for a letter while you're still reading. In `"swiss"`, the first `s` looks unique right up until the second `s` arrives. So split the work into two passes:

1. **Count.** Walk the string once and count every letter. `Counter(s)` does it in one call; a plain dictionary or a list of 26 integers works just as well.
2. **Look.** Walk the string again, left to right. The first index whose letter has a count of exactly `1` is the answer. If the walk finishes without finding one, return `-1`.

The second pass goes through the string in its own order, not through the alphabet — that's what makes the answer the *leftmost* unique letter rather than, say, the alphabetically first one.

On `"swiss"`, the counts are `s: 3, w: 1, i: 1`. The second pass checks `s` (3, skip), then `w` (1) — the answer is index 1.

Why not just call `s.count(ch)` at each position? It gives the right answer, but each call scans the whole string, so `n` calls cost `O(n^2)` — around ten billion steps for `10^5` letters. Counting once up front and then asking the dictionary is what keeps it linear.

**Spotting it next time:** whenever the decision about one element depends on the whole collection — "unique", "appears `k` times", "most frequent", "has a partner somewhere" — make a counting pass first, then a second pass that uses the counts. Two passes of `O(n)` are still `O(n)`.

## Complexity

`O(n)` time: two passes over the string, `O(1)` work per letter. `O(1)` extra space: there are only 26 different letters to count, however long the string is.

## Pitfalls

- Looping over the alphabet and returning the first letter with count `1`. That finds the alphabetically first unique letter: in `"swiss"` it picks `i` (index 2) instead of `w` (index 1).
- Calling `s.count(ch)` for every position — correct, but `O(n^2)`, and too slow for `10^5` letters.
- A one-pass shortcut that adds a letter to a dictionary the first time and deletes it the second time. A third copy adds it back, so in `"aaab"` the third `a` looks unique. Count properly, or keep a separate "seen more than once" set.
