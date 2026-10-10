# Edit Distance

## The task

You can change a string with three kinds of single-character edit, each costing 1:

- insert a character anywhere
- delete a character
- replace a character with a different one

Return the minimum number of edits that turn `word1` into `word2`.

## Examples

**Example 1**

```
word1 = "tuesday", word2 = "thursday"   -> 2
```

Insert `h` after the `t` (`thuesday`), then replace the `e` with an `r` (`thursday`).

**Example 2**

```
word1 = "garden", word2 = "pardon"   -> 2
```

Two replacements, `g → p` and `e → o`. Deleting a letter and inserting another would cost two edits for each.

**Example 3**

```
word1 = "", word2 = "abc"   -> 3
```

Starting from nothing, it takes three inserts.

## Constraints

- `0 <= word1.length, word2.length <= 500`
- `word1` and `word2` consist of lowercase English letters.

## Aim for

`O(m·n)` time and `O(min(m, n))` space. Let `d[i][j]` be the distance between the prefixes `word1[:i]` and `word2[:j]`, and look at their last characters: if they're equal, `d[i][j] = d[i-1][j-1]`; otherwise it's one plus the cheapest of the three edits. Fill row by row and keep only the previous row.

## Follow-ups

- Return the edits themselves, not just how many.
- Inserts, deletes and replacements have different costs. What changes?
- You only need to know whether the distance is at most a small `k`. Can you beat `O(m·n)`?
