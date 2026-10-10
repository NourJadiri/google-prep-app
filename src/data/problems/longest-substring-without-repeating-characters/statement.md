# Longest Substring Without Repeating Characters

## The task

Given a string `s`, return the length of the longest substring of `s` in which no character occurs more than once.

A substring is a contiguous run of characters: `"bag"` is a substring of `"cabbage"`, but `"cbg"` is not. Characters are compared exactly, so `"a"` and `"A"` are different, and spaces, digits and symbols count like any other character.

## Examples

**Example 1**

```
s = "cabbage"   -> 4
```

`"bage"` has no repeats. Anything longer would have to contain both `b`s.

**Example 2**

```
s = "go go"   -> 3
```

`"go "` (with the space) and `" go"` both work. `"go g"` repeats the `g`.

**Example 3**

```
s = ""   -> 0
```

## Constraints

- `0 <= s.length <= 5 * 10^4`
- `s` consists of printable ASCII characters: English letters, digits, symbols and spaces.

## Aim for

One pass in `O(n)` time with a sliding window `[start, i]` that never contains a repeat. Remember the index where each character was last seen. When `s[i]` was last seen inside the window, jump `start` just past that index, and think carefully about the case where the last sighting is *before* the window. Space is `O(min(n, alphabet size))`.

## Follow-ups

- Return the substring itself, not just its length.
- Allow each character to appear at most twice. Or: the longest substring with at most `k` distinct characters.
- The input is now arbitrary Unicode. Does anything in your solution change?
