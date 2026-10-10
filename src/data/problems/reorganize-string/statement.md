# Reorganize String

## The task

Rearrange the letters of `s` so that no two neighbouring characters are equal, and return the result. A rearrangement uses every letter of `s` exactly as often as it appears there — nothing added, nothing dropped. If no rearrangement avoids equal neighbours, return the empty string `""`.

Many strings have several valid answers; any one of them is accepted.

## Examples

**Example 1**

```
s = "aaabc"   -> "abaca"
```

`"acaba"` is just as good. With five slots, the three `a`s have to take positions `0`, `2` and `4`.

**Example 2**

```
s = "zzzzy"   -> ""
```

Four `z`s need three separators between them, and there is only one other letter.

**Example 3**

```
s = "q"   -> "q"
```

A single letter has no neighbour to clash with.

## Constraints

- `1 <= s.length <= 500`
- `s` consists of lowercase English letters.

## Aim for

Start with the counting argument: an answer exists exactly when no letter occurs more than `ceil(n / 2)` times. Then build it greedily with a max-heap of counts — always place the most plentiful letter other than the one just placed, which sits out a turn. That's `O(n log k)` for `k` distinct letters, effectively `O(n)` with at most 26. Even simpler once you trust the counting: deal the letters, most frequent first, into positions `0, 2, 4, …` and then `1, 3, 5, …`.

## Follow-ups

- Equal letters must now be at least `k` positions apart, not merely non-adjacent.
- Why must the slot-dealing version start with the most frequent letter? Find an input that breaks if it starts with another.
- Tasks take one time unit each, equal tasks need `n` units of cooldown between them, and idling is allowed. How short can the schedule be?
