# Letter Combinations of a Phone Number

## The task

On a classic phone keypad, each digit from `2` to `9` carries a few letters:

- `2` → abc, `3` → def, `4` → ghi, `5` → jkl
- `6` → mno, `7` → pqrs, `8` → tuv, `9` → wxyz

Given a string `digits`, return every string you can spell by picking one letter for each digit, keeping the digits' order. Return them in any order. An empty `digits` spells nothing: return `[]`, not `[""]`.

## Examples

**Example 1**

```
digits = "47"   -> ["gp","gq","gr","gs","hp","hq","hr","hs","ip","iq","ir","is"]
```

Three letters for `4` times four for `7`: twelve strings.

**Example 2**

```
digits = "9"   -> ["w","x","y","z"]
```

## Constraints

- `0 <= digits.length <= 4`
- Each `digits[i]` is a digit from `'2'` to `'9'`.

## Aim for

Backtracking, one digit per level: for each letter of the current digit, choose it, explore the next digit, un-choose; at depth `len(digits)`, join the path into a string. With up to four letters per key that's `O(4^n · n)` time, exactly the size of the output, and `O(n)` extra space. Handle the empty input before you start, or the recursion returns `[""]`.

## Follow-ups

- Build it iteratively: start from `[""]` and extend every string by every letter of the next digit. Where does the empty case go now?
- Return only the combinations that are words in a given dictionary. Where can you prune?
- Let `digits` contain `0` and `1`, which carry no letters. Skip them, or return nothing? Pick one and defend it.
