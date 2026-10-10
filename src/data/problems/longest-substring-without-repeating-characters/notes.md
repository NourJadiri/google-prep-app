## Approach

Use a sliding window. Keep a window `s[start..i]` that contains no repeated character, grow it one character at a time on the right, and track the largest window ever seen.

When the new character `s[i]` already occurs inside the window, the window has to give up everything up to and including that earlier copy. You could step `start` forward one character at a time, but it's simpler to remember where every character was last seen. The earlier copy is at `last[s[i]]`, so `start` jumps straight to `last[s[i]] + 1`.

There's one subtlety: `last` remembers positions from the whole string, not just the window. If the previous copy of `s[i]` lies *before* `start`, it isn't in the window and nothing needs to move. Jumping to `last[s[i]] + 1` in that case would pull `start` backwards and re-admit a repeat. In `"abba"`, by the time the final `a` arrives the window is just `"b"` (index 2), and the old `a` at index 0 is already outside it. Moving `start` back to 1 would count `"bba"`. Guard the jump with `last[ch] >= start`, or write `start = max(start, last[ch] + 1)`.

Why it's correct: for every end `i`, the window `[start, i]` is the longest repeat-free substring ending at `i`. `start` moves only when a repeat forces it, and only exactly far enough. The answer is the largest of those windows.

## Complexity

`O(n)` time: one pass, with `O(1)` dictionary work per character. `O(min(n, Σ))` space for the last-seen map, where `Σ` is the alphabet size (95 printable characters here).

For comparison, restarting from every position and growing until a repeat costs `O(n · Σ)`, because a run can't grow past `Σ` characters. That's tolerable for 95 characters and quadratic for Unicode. Re-checking each candidate substring with `len(set(s[i:j]))` stacks another factor of `Σ` on top, and checking every substring without stopping at the first repeat is cubic, which is hopeless at `5 * 10^4` characters.

## Pitfalls

- Moving `start` backwards when the previous copy is already outside the window, as in `"abba"`.
- Off-by-one in the length: the window `s[start..i]` holds `i - start + 1` characters.
- Resetting the window entirely on a repeat instead of moving `start` just past the earlier copy. In `"pqrstpabc"` the second `p` should keep `"qrst"`.
