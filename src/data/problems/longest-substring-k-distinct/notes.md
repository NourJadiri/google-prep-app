## Approach

Variable-size sliding window. Keep a window `s[left..right]` and a dictionary `counts` of how often each character occurs inside it, with one rule: a character whose count drops to zero is deleted, so `len(counts)` is always the number of distinct characters in the window.

Move `right` across the string one character at a time:

1. **Grow:** add `s[right]` to `counts`.
2. **Repair:** while `len(counts) > k`, remove `s[left]` from the window (decrement, delete at zero) and advance `left`.
3. **Measure:** the window is now valid; record `right - left + 1` if it's the best so far.

Why this finds the optimum: for each `right`, the repair loop leaves `left` at the smallest index whose window is valid — any window ending at `right` and starting further left contains this one plus more characters, so it has at least as many distinct characters, and the loop already proved it has too many. So every right end is paired with its longest valid window, and the best of those is the answer. `left` never moves backwards, because a window that was invalid for `right` stays invalid for `right + 1`.

With `k = 0`, every character is removed again in the same step it was added, the width is always `0`, and the answer `0` falls out of the same loop.

## Complexity

`O(n)` time: `right` visits each index once and `left` advances at most `n` times in total across all repairs; each step is `O(1)` dictionary work. `O(k)` extra space — the window never holds more than `k + 1` distinct characters.

## Pitfalls

- Measuring before repairing records a window that is one character over budget (with `k = 0` it even reports `1`).
- Decrementing counts without deleting zeros: `len(counts)` then overstates the distinct count, so the window shrinks for no reason or the repair never ends. Counting the non-zero values each step fixes that at an `O(k)` cost per step.
- Re-scanning the window (`len(set(s[left:right + 1]))`) turns this into `O(n · window)`.
- A 26-slot array indexed by `ord(ch) - ord('a')` breaks on capitals, digits and spaces — this string can hold any printable character.
