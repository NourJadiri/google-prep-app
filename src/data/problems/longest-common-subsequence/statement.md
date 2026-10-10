# Longest Common Subsequence

## The task

Given two strings `text1` and `text2`, return the length of the longest string that is a subsequence of both. If they have no letter in common, return `0`.

A subsequence is what remains after deleting any number of characters (possibly none) without reordering the rest: `"art"` is a subsequence of `"heart"`, but `"tar"` is not.

## Examples

**Example 1**

```
text1 = "stone", text2 = "longest"   -> 3
```

`"one"` appears, in order, in both words. `"st"` is common too, but shorter.

**Example 2**

```
text1 = "kite", text2 = "plum"   -> 0
```

No letter appears in both words.

**Example 3**

```
text1 = "abcd", text2 = "dcba"   -> 1
```

Every letter is shared, but in opposite orders: keep any two and they're out of order in one of the words. Only one letter survives.

## Constraints

- `1 <= text1.length, text2.length <= 1000`
- Both strings consist of lowercase English letters.

## Aim for

Let `dp[i][j]` be the LCS length of the prefixes `text1[:i]` and `text2[:j]`. If their last letters match, both can join an optimal answer: `dp[i][j] = dp[i-1][j-1] + 1`. Otherwise at least one of the two last letters is useless: `dp[i][j] = max(dp[i-1][j], dp[i][j-1])`. Row 0 and column 0 are 0. For lengths `m` and `n` that's `O(m · n)` time; each row needs only the previous one, so `O(min(m, n))` space.

## Follow-ups

- Reconstruct one longest common subsequence, not just its length.
- Edit distance (insert, delete, replace): the same table with a different recurrence.
- The shortest string that contains both as subsequences (Shortest Common Supersequence).
