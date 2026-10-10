# Roman to Integer

## The task

A Roman numeral is built from seven symbols, each worth a fixed amount:

- `I` = 1, `V` = 5, `X` = 10, `L` = 50, `C` = 100, `D` = 500, `M` = 1000

Most of the time the symbols run from the biggest value down to the smallest, and the numeral is simply their sum: `XXVII` is `10 + 10 + 5 + 1 + 1 = 27`.

There is one exception. When a smaller symbol sits **immediately before** a larger one, its value is subtracted instead of added. Only six such pairs occur in valid numerals:

- `IV` = 4 and `IX` = 9
- `XL` = 40 and `XC` = 90
- `CD` = 400 and `CM` = 900

Given a valid Roman numeral `s` for a whole number between 1 and 3999, return its value as an integer.

## Examples

**Example 1**

```
s = "DCLXVI"   -> 666
```

Every symbol is smaller than the one before it, so they all add up: `500 + 100 + 50 + 10 + 5 + 1`.

**Example 2**

```
s = "CDXLIV"   -> 444
```

Three subtractive pairs in a row: `CD` = 400, `XL` = 40, `IV` = 4.

**Example 3**

```
s = "MMMCMXCIX"   -> 3999
```

The largest value allowed: `MMM` = 3000, then `CM` = 900, `XC` = 90 and `IX` = 9.

## Constraints

- `1 <= s.length <= 15`
- `s` contains only the symbols `I`, `V`, `X`, `L`, `C`, `D` and `M`.
- `s` is a valid Roman numeral for a value from 1 to 3999.

## Aim for

Go through the symbols left to right, and decide each symbol's sign by peeking at the symbol **right after it**: what does it tell you when the next symbol is bigger? A small dictionary from symbol to value is all the setup you need. One pass: `O(n)` time, `O(1)` space.

## Follow-ups

- Go the other way: turn an integer from 1 to 3999 into a Roman numeral.
- How would you reject invalid input such as `"IIII"`, `"VX"` or `"IC"`?
