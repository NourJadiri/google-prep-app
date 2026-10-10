# Longest Substring with At Most K Distinct Characters

Stands in for LeetCode 340 (premium). Original statement written for this app — same task, own words and examples.

## The task

Given a string `s` and an integer `k`, return the length of the longest contiguous substring of `s` that uses at most `k` different characters.

Every character counts, compared exactly: `"a"` and `"A"` are different characters, and so are spaces, digits and punctuation. Implement `lengthOfLongestSubstringKDistinct(s, k)`, returning that length as an integer.

## Examples

**Example 1**

```
s = "acacab", k = 2   -> 5
```

`"acaca"` uses only `{a, c}`. Adding the final `b` would make three distinct characters.

**Example 2**

```
s = "xyz", k = 1      -> 1
```

Every character breaks the budget immediately; any single letter is the best you get.

**Example 3**

```
s = "aabbcc", k = 2   -> 4
```

`"aabb"` (or `"bbcc"`).

**Example 4**

```
s = "aaaa", k = 3     -> 4
```

You never have to *spend* the whole budget.

## Constraints

- `1 <= s.length <= 5 * 10^4`, `0 <= k <= 50`
- `s` consists of printable ASCII characters (letters of either case, digits, punctuation, spaces).
- Watch `k = 0`: the answer is `0`, and your loop should produce it, not special-case it.

## Aim for

`O(n)` with the day-9 invariant verbatim: grow the right edge greedily; while the window holds more than `k` distinct characters, shrink from the left; record the width after every repair. Keep counts in a map and track distinct-size as counts hit and leave zero — recounting the map each step quietly makes it `O(n·k)`.

## Follow-ups

- Exactly-`k` distinct instead of at-most — what changes? (Classic trick: atMost(k) - atMost(k-1) counts substrings; for longest, adjust the window test.)
- The input is a stream and `k` is large — memory story?
- Where did this pattern already appear this fortnight, disguised? (Day 9's whole station.)
