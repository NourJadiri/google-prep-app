## Approach

**A monotonic stack of unresolved days.** Sweep left to right, keeping a stack of the indices of days that haven't met a warmer day yet. Their temperatures never rise from the bottom of the stack to the top: a warmer day pushed above a colder one would have resolved it on the way in.

For each new day `i` with temperature `t`:

1. While the day on top of the stack is strictly colder than `t`, pop it — call it `j`. Day `i` is the first warmer day `j` has met, so `answer[j] = i - j`.
2. Push `i`. It waits now too.

Days still on the stack at the end never met a warmer day and keep their `0`.

Why `i` is the *first* warmer day for `j`: every day between them was no warmer than `j` — otherwise it would have popped `j` already. Why it's linear: each index is pushed once and popped at most once, so all the inner `while` loops together pop at most `n` times. Charge each pop to its push.

Keep indices on the stack, not temperatures: the index gives the distance, and the temperature is one lookup away.

This is the **next greater element** pattern. Flip the comparison or the direction and the same stack answers next-smaller, previous-greater and previous-smaller — the engine behind Largest Rectangle in Histogram, Online Stock Span and Trapping Rain Water.

## Complexity

`O(n)` time: `n` pushes and at most `n` pops in total. `O(n)` extra space for the stack in the worst case — a cooling trend keeps every day waiting.

## Pitfalls

- Popping on `<=`: an equal temperature isn't warmer, and `[50,50,51]` comes out `[1,1,0]` instead of `[2,1,0]`.
- Pushing temperatures instead of indices, which leaves no way to compute the wait.
- The forward scan from each day looks fine on random data and is quadratic on long plateaus.
