# First Unique Character in a String

## The task

The string `s` is made of lowercase English letters. Some letters appear just once in it; others repeat. Return the index (counting from 0) of the **leftmost letter that appears exactly once** in the whole string, or `-1` if every letter repeats.

"Leftmost" is about position in the string: if several letters appear exactly once, the one that comes earliest wins — not the one earliest in the alphabet.

## Examples

**Example 1**

```
s = "swiss"   -> 1
```

`s` appears three times. `w` (index 1) and `i` (index 2) each appear once, and `w` comes first.

**Example 2**

```
s = "racecars"   -> 3
```

`r`, `a` and `c` each appear twice. `e` (index 3) and the final `s` (index 7) appear once, and `e` is further left.

**Example 3**

```
s = "xyxy"   -> -1
```

Every letter repeats, so there's no answer.

## Constraints

- `1 <= s.length <= 10^5`
- `s` contains only lowercase English letters.

## Aim for

Whether a letter is unique depends on the **whole** string, including the part you haven't read yet — in `"swiss"`, the first `s` looks unique until the next one shows up. So don't try to decide in one go: first gather the information about every letter, then go looking for the answer. Two passes, `O(n)` time, and only `O(1)` extra space since there are just 26 letters.

## Follow-ups

- The letters arrive one at a time from a stream, and after each one you're asked for the first unique letter so far. What would you keep?
- Make a single pass over `s`, allowing yourself one extra loop over the 26 letters afterwards.
