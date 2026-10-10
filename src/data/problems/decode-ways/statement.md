# Decode Ways

## The task

A message of capital letters was encoded by replacing each letter with its position in the alphabet (`A → 1`, `B → 2`, …, `Z → 26`) and writing the numbers back to back with nothing in between. Given the resulting digit string `s`, return the number of different ways to split it back into letters.

Every piece of a split must be a number from `1` to `26` written without a leading zero: `"6"` is a valid piece, `"06"` is not, and `"0"` on its own decodes to nothing. If `s` can't be split at all, return `0`.

## Examples

**Example 1**

```
s = "1215"   -> 5
```

`1 2 1 5`, `12 1 5`, `1 21 5`, `1 2 15` and `12 15`, which spell `ABAE`, `LAE`, `AUE`, `ABO` and `LO`.

**Example 2**

```
s = "2030"   -> 0
```

The `2` must take the first `0` as `20`, but nothing can absorb the second `0`: `30` is too big and `"0"` alone is no letter.

**Example 3**

```
s = "1101"   -> 1
```

Only `1 10 1` works. The `0` forces `10`, which leaves the first `1` on its own.

## Constraints

- `1 <= s.length <= 100`
- `s` contains only digits and may start with `0`.
- The answer fits in a signed 32-bit integer.

## Aim for

`O(n)` time and `O(1)` space. The last letter of a decoding uses either the last digit or the last two, so `ways(i) = ways(i - 1)` (when digit `i` isn't `0`) `+ ways(i - 2)` (when the last two digits form `10`–`26`). It's Fibonacci with conditions: keep two running values.

## Follow-ups

- A `'*'` in `s` may stand for any digit from 1 to 9. Count the decodings modulo `10^9 + 7`.
- Return every decoding instead of the count. How large can that output get?
- The digits arrive one at a time as a stream. What do you keep between digits?
