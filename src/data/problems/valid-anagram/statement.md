# Valid Anagram

## The task

Two strings are **anagrams** when one is a rearrangement of the other: they contain exactly the same letters, each letter the same number of times. Only the order may differ.

You're given two strings, `s` and `t`, made of lowercase English letters. Return `True` when `t` is a rearrangement of `s` and `False` when it isn't. A string counts as an anagram of itself.

## Examples

**Example 1**

```
s = "night", t = "thing"   -> true
```

Both use one each of `n`, `i`, `g`, `h` and `t`.

**Example 2**

```
s = "aab", t = "abb"   -> false
```

The same two letters show up in both, but `s` has two `a`s and `t` has only one. Counts matter, not just which letters appear.

**Example 3**

```
s = "tea", t = "seat"   -> false
```

Every letter of `"tea"` is in `"seat"`, but `"seat"` has an extra `s`. Strings of different lengths can never be anagrams.

## Constraints

- `1 <= s.length, t.length <= 5 * 10^4`
- `s` and `t` contain only lowercase English letters, `a` to `z`.

## Aim for

Order is the one thing anagrams don't share, so find a way to describe a string that ignores order. Two good ones: sort both strings and compare (`O(n log n)`), or **count** how often each letter appears and compare the counts (`O(n)`). A dictionary from letter to count works, and since there are only 26 letters it stays small however long the strings get. Compare the lengths first — it settles many cases for free.

## Follow-ups

- The strings may contain any Unicode characters, not just `a` to `z`. Which of your approaches still works unchanged?
- Given a list of words, group together the ones that are anagrams of each other.
- Find every position in a long text where some rearrangement of a short word begins.
