# Decode String

## The task

A string was compressed with a single rule: `k[text]` stands for `text` written out `k` times in a row. Groups can nest inside each other, and plain letters can appear anywhere — before, between, after and inside groups. Given the compressed string `s`, return the decoded string.

`s` is always well formed: every `[` has a matching `]` and comes right after its count, a positive whole number written in one or more decimal digits. Digits appear nowhere else, so the decoded string is made of lowercase letters only.

## Examples

**Example 1**

```
s = "3[ka]z"   -> "kakakaz"
```

**Example 2**

```
s = "2[x3[y]]"   -> "xyyyxyyy"
```

Inside out: `3[y]` is `yyy`, which leaves `2[xyyy]`.

**Example 3**

```
s = "12[o]"   -> "oooooooooooo"
```

A count can be more than one digit long: twelve `o`s.

## Constraints

- `1 <= s.length <= 30`
- `s` consists of lowercase English letters, digits, `[` and `]`, and is a valid encoding.
- Every count is between `1` and `300`.
- The decoded string has at most `10^5` characters.

## Aim for

One pass with a stack, in time proportional to the output. On a digit, extend the count (`k = 10*k + d`); on `[`, push the text built so far together with the count, then start both fresh; on `]`, pop and continue with `saved + k * text`; on a letter, append it. The recursive version — decode until the matching `]`, return the text and where you stopped — is equally good; be ready to say which you'd rather debug.

## Follow-ups

- The decoded string is far too long to hold in memory. Produce it lazily, one character at a time.
- Return only the character at position `i` of the decoded string, without building it.
- Write the encoder: given a plain string, find a short encoding of it. What makes "shortest" hard?
