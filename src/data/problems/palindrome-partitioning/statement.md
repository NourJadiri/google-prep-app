# Palindrome Partitioning

## The task

Cut a string `s` into one or more consecutive pieces so that every piece is a palindrome, a string that reads the same forwards and backwards. Return every way of doing it, each as the list of its pieces in order (joined back together, they spell `s`). The partitions can come in any order.

A single character is always a palindrome, so there is at least one answer: `s` cut into single letters.

## Examples

**Example 1**

```
s = "racecar"   -> [["r","a","c","e","c","a","r"],["r","a","cec","a","r"],["r","aceca","r"],["racecar"]]
```

The palindromes nest: `"cec"` sits inside `"aceca"`, which sits inside `"racecar"`.

**Example 2**

```
s = "aaa"   -> [["a","a","a"],["a","aa"],["aa","a"],["aaa"]]
```

`["a","aa"]` and `["aa","a"]` cut in different places, so both count.

**Example 3**

```
s = "z"   -> [["z"]]
```

## Constraints

- `1 <= s.length <= 16`
- `s` consists of lowercase English letters.

## Aim for

Backtracking over where the next piece ends: from `start`, try every `end` for which `s[start..end]` is a palindrome; choose that piece, explore from `end + 1`, un-choose. A string of `n` equal letters has `2^(n-1)` partitions, so `O(n · 2^n)` time is unavoidable. Precompute a table `pal[i][j]` (true when `s[i] == s[j]` and the inside is a palindrome) so every check is `O(1)` instead of an `O(n)` reversal.

## Follow-ups

- Return only the fewest cuts needed (Palindrome Partitioning II). It's a DP, with no enumeration at all.
- Count the partitions without listing them.
- Every piece must now be at least two letters long. What changes, and can the answer be empty?
