## Approach

**Start simple: a stack.** Build each box's final text the way the keyboard would. Start with an empty list and go through the keys. A letter gets appended, and a `#` pops the last letter off if there is one. Then compare the two results. This is the stack pattern: backspace always removes the most recently typed letter that's still there. It costs `O(n + m)` time and space, and it's the answer to give first in an interview.

**Then save the space: two pointers, walking backwards.** Reading forwards has a problem: you can't tell whether a letter survives until you've seen the keys after it. Read from the end and that problem goes away, because each `#` comes *before* the letters it deletes. Keep a counter, `skip`, of the backspaces you still owe:

- When you see a `#`, do `skip += 1`.
- When you see a letter and `skip > 0`, that letter gets deleted, so do `skip -= 1`.
- When you see a letter and `skip == 0`, the letter survives. It's the next character of the final text, reading right to left.

Put that in a helper that starts at a position, walks left to the next surviving letter, and returns its index (or `-1` if there isn't one). Then run one pointer on each string. Find the next survivor in `s` and in `t`, then:

- If both strings ran out at the same time, every letter matched, so return `True`.
- If only one ran out, one text is longer than the other, so return `False`.
- If both have a letter but the letters differ, return `False`.
- Otherwise move both pointers one step left and repeat.

Here's a trace of `s = "bxj##tw"` and `t = "bxj###tw"`. From the right, both strings give `w`, then `t`. In `s`, the next search passes `##`, skips `j` and `x`, and lands on `b`. In `t`, the three backspaces skip `j`, `x` and `b`, and the pointer runs off the start. One string ran out and the other didn't, so the answer is `False`.

**Spotting it next time.** Try reading backwards whenever an instruction changes what came *before* it, like backspaces or "undo the last three". From the end, you learn about the instruction before you reach the things it affects. And two pointers moving through two sequences side by side is the standard way to compare or merge sequences without building copies of them.

## Complexity

Stack: `O(n + m)` time, and `O(n + m)` space for the two finished texts.

Two pointers: `O(n + m)` time, because each pointer only ever moves left, so every character is looked at once. `O(1)` extra space.

## Pitfalls

- Backspace on an empty box has to do nothing. In the list version, calling `pop()` on an empty list crashes, so check that the list isn't empty first.
- In the backwards version, stopping as soon as *either* string runs out. With `"ab"` and `"b"`, both give `b` first, and then `t` is used up while `s` still has `a`. That's `False`, not `True`.
- Assuming each `#` deletes the character right next to it in the original string. In `"ab##"`, the second `#` deletes `a`, because `b` is already gone. The `skip` counter handles chains like this.
