## Approach

**The pattern: look one step ahead.** Reading left to right, every symbol's value is either added or subtracted, and the symbol *right after it* decides which:

- If the next symbol is **larger**, this symbol is the first half of a subtractive pair (`IV`, `XC`, `CM`, …), so subtract its value.
- Otherwise — the next symbol is equal or smaller, or there is no next symbol — add it.

Here's `CDXLIV`:

```
symbol   C     D     X     L     I     V
sign     -100  +500  -10   +50   -1    +5     total 444
```

`C` comes before the larger `D`, so it's subtracted; `D` comes before the smaller `X`, so it's added; and so on down the line.

Why does that work? In a valid numeral, the only place a smaller symbol comes before a larger one is a subtractive pair. Subtracting the small symbol and adding the big one gives exactly the pair's value: `IV` becomes `-1 + 5 = 4`, `CM` becomes `-100 + 1000 = 900`. Every other symbol simply adds.

The code needs a dictionary from symbol to value (`{"I": 1, "V": 5, …}`) for the lookups, and the check `i + 1 < len(s)` so the last symbol doesn't peek past the end of the string.

**The same idea backwards.** You can also walk right to left, remembering the value of the symbol you just passed (the one to the right). If the current symbol is smaller than that, subtract it; otherwise add it. No peeking ahead, so no bounds check.

**Spotting it next time:** when a character's meaning depends on its neighbour — a two-character token, an escape sequence, a minus sign in front of a number — read with one step of lookahead, or walk backwards and remember what you just saw. A dictionary turns symbols into values.

## Complexity

`O(n)` time for a numeral of `n` symbols, with `O(1)` work per symbol. `O(1)` space: the seven-entry dictionary never grows. With at most 15 symbols this is tiny either way; what an interviewer wants to see is one clean pass.

## Pitfalls

- Reading `IV` as `I + V = 6` — forgetting the subtraction rule.
- Adding every symbol, then "correcting" a pair by subtracting the small value once. It was already added, so it has to come off **twice**: `IV` is `1 + 5 - 2 * 1`.
- Subtracting when the next symbol is *equal*, as in `II` or `XX`. Only a strictly larger next symbol means subtraction.
