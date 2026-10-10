## Approach

**The pattern: a stack.** Think of a stack as a pile of plates. You can only touch the top: *push* puts something on top, and *pop* takes the top thing off. Whatever went in last comes out first. A plain Python list works as a stack: `append` pushes, `pop()` pops, and `stack[-1]` looks at the top without removing it.

Why does that fit this problem? Read `[{()}]` from left to right. When the `)` arrives, the only bracket it may close is `(`, because that's the most recent bracket still open. Once that pair is done, `}` must close `{`, the next most recent. A closer always deals with the newest unfinished opener, and the top of a stack is always the newest thing on it.

So walk through `s` once:

1. **An opener** (`(`, `[` or `{`) can't be checked yet. Push it and move on.
2. **A closer** has to match the opener on top of the stack. If the stack is empty (nothing is open) or the top is a different kind, the string is unbalanced, so return `False`. Otherwise pop the top: that pair is finished.
3. **At the end**, the stack holds every opener that was never closed. The string is balanced only if the stack is empty.

A small dictionary from each closer to its opener (`")": "("` and so on) turns step 2 into a single comparison.

Here's a trace of `{(})`: push `{`, push `(`. Then `}` arrives, but the top is `(`. That's a mismatch, so the answer is `False`.

Why is this enough? A bracket string can only fail in three ways: a closer of the wrong kind, a closer with nothing open, or openers left at the end. Step 2 catches the first two the moment they happen, and step 3 catches the last.

**Spotting it next time.** Reach for a stack when things have to be matched or undone in the reverse of the order they arrived. Nested brackets, HTML tags, an editor's undo button and evaluating an expression all work this way. If you keep asking "what's the latest thing I haven't dealt with yet?", you want a stack.

## Complexity

`O(n)` time: each character is pushed and popped at most once, and each of those steps is `O(1)`. `O(n)` extra space in the worst case, because a string of only openers puts every character on the stack.

A quick early exit is worth mentioning: a string of odd length can never be balanced.

## Pitfalls

- Popping from an empty stack. A closer with nothing open, as in `")("`, should give `False`, not a crash. Check `if not stack` before you pop.
- Returning `True` after the loop without checking that the stack is empty. `"(()"` gets all the way through the loop without a mismatch, and the leftover `(` is the only sign that something's wrong.
- Counting instead of stacking. One counter per kind catches `"(()"` but not `"[(])"`. There, the counts balance but the order doesn't.
