# Longest Common Prefix

## The task

You're given a list of strings `strs`. Return the longest string that **every** string in the list starts with — their longest common prefix. If they don't all start with the same letter, return the empty string `""`.

A string counts as a prefix of itself, so when one string is the beginning of all the others, the answer is that whole string. If the list holds an empty string, the answer is `""`.

## Examples

**Example 1**

```
strs = ["interview","internet","interval"]   -> "inter"
```

All three start with `inter`. At the next letter they split: `v`, `n` and `v`.

**Example 2**

```
strs = ["cart","car","carbon"]   -> "car"
```

`"car"` is a whole string in the list, and the other two start with it. The answer can never be longer than the shortest string.

**Example 3**

```
strs = ["apple","banana","apricot"]   -> ""
```

`"banana"` doesn't start with `a`, so nothing is shared — even though `"apple"` and `"apricot"` agree on `ap`.

## Constraints

- `1 <= strs.length <= 200`
- `0 <= strs[i].length <= 200`
- Each `strs[i]` contains only lowercase English letters.

## Aim for

Imagine the strings written one above the other, and read them **column by column**: the first letter of every string, then the second letter of every string, and so on. Stop at the first column where some string has a different letter — or has run out of letters. That's `O(S)` time, where `S` is the total number of characters, and no extra space beyond the answer.

## Follow-ups

- Sort the list first. Why is it then enough to compare only the first and last strings?
- You'll be asked for the common prefix of many different groups of words drawn from one big dictionary. What would you build once, up front, to answer each question quickly?
