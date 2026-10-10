# Longest Palindromic Substring

## The task

Given a string `s`, return its longest **substring** (a contiguous run of characters) that reads the same forwards and backwards.

If several different substrings tie for the longest, return any one of them: every palindromic substring of the maximum length is accepted. Characters are compared exactly, so `'A'` and `'a'` are different.

## Examples

**Example 1**

```
s = "bananas"   -> "anana"
```

It's centred on the middle `n`. The shorter palindromes `"ana"` and `"nan"` sit inside it.

**Example 2**

```
s = "cabbad"   -> "abba"
```

An even-length palindrome: its centre is the gap between the two `b`s, not a character.

**Example 3**

```
s = "pqrqpxyzyx"   -> "pqrqp"
```

`"xyzyx"` is just as long and would be accepted too.

## Constraints

- `1 <= s.length <= 1000`
- `s` consists of English letters (upper and lower case) and digits.

## Aim for

`O(n^2)` time and `O(1)` extra space by expanding around each of the `2n - 1` centres: every character for odd lengths, every gap between neighbours for even ones. The interval DP (`s[i..j]` is a palindrome when `s[i] == s[j]` and `s[i+1..j-1]` is one) is also `O(n^2)` but needs `O(n^2)` memory. Checking every substring from scratch is `O(n^3)`.

## Follow-ups

- Count every palindromic substring instead of finding the longest.
- Longest palindromic *subsequence*, where the characters needn't be adjacent. What's the DP now?
- Get to `O(n)` with Manacher's algorithm. What does it reuse from earlier centres?
