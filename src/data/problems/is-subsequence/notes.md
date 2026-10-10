## Approach

**The pattern: two pointers, one in each sequence.** When two sequences have to be lined up in order, walk through them together. Here, `i` points at the next letter of `s` that still needs a match, and you walk through `t` one letter at a time. If the current letter of `t` equals `s[i]`, it becomes that letter's match and `i` moves on. Either way, you move on in `t`. When `t` runs out, `s` is a subsequence exactly when every one of its letters got matched: `i == len(s)`.

Tracing `s = "dog"` and `t = "dragon"`:

```
d: matches d       i = 1, now looking for o
r, a, g: not o     skip (the g goes by while we still need the o)
o: matches o       i = 2, now looking for g
n: not g           t is used up and g never matched -> false
```

**Why grabbing the first match is safe.** Suppose `s[i]` could be matched at several places in `t`. Taking the earliest one leaves the most of `t` for the letters after it. Any valid matching that used a later position could be shifted to the earlier one without breaking anything after it. So if any matching exists, the greedy walk finds one. This style of argument (take any answer, swap in the greedy choice, and show nothing gets worse) is how greedy choices are justified in general.

**Spotting it next time.** "Subsequence" means the order is kept but gaps are allowed: walk with one pointer per sequence. (A "substring" or "subarray" allows no gaps, and calls for different tools.) The same one-pointer-per-sequence walk is behind merging two sorted lists. When *both* strings have choices to make, as in Longest Common Subsequence, greedy stops working and dynamic programming takes over.

For the billion-queries follow-up: record, for each letter, the sorted list of positions where it appears in `t`. Then each letter of `s` jumps to its first position after the previous match with a binary search, so a query costs `O(len(s) * log(len(t)))` instead of a full pass over `t`.

## Complexity

`O(len(t))` time: one pass over `t`, constant work per letter. `O(1)` extra space.

## Pitfalls

- Checking only that each letter of `s` appears somewhere in `t` (`c in t`). That ignores order and repeats, so it says yes to `"dog"` and `"dragon"`.
- Using `t.find(c, pos)` but not moving past the match afterwards (`pos = found + 1`). A repeated letter in `s` then reuses one letter of `t`, and `"boot"` "fits" inside `"robot"`.
- Forgetting the empty cases: an empty `s` is a subsequence of anything, even an empty `t`.
