## Approach

**The pattern: paper arithmetic, digit by digit, with a carry.** When a number is stored as a list (or a string, or a linked list) of digits, you do arithmetic the way you learned on paper: start at the least significant digit, here the right end, and pass a carry to the left.

Adding one is the simplest case. Look at the last digit:

- If it's less than `9`, add one to it. There's no carry, and you're done.
- If it's `9`, it becomes `0`, and a carry of one moves to the next digit on the left. Repeat the same check there.

The carry stops at the first digit that isn't a `9`. If every digit was a `9`, the carry falls off the front: the answer is a `1` followed by all those zeros, one digit longer than the input.

Tracing both kinds of example:

```
[2,5,9]:  9 -> 0, carry;  5 -> 6, stop                            [2,6,0]
[9,9]:    9 -> 0, carry;  9 -> 0, carry;  out of digits, add a 1  [1,0,0]
```

**Why not just use `int`?** In Python, `int("".join(map(str, digits))) + 1` works, because Python integers can be any size. In Java or C++, a 100-digit number overflows every built-in integer type. The interviewer wants to see whether you can do the arithmetic by hand, so mention the shortcut, then write the loop.

**Spotting it next time.** Numbers given as digit lists, strings or linked lists: simulate the arithmetic digit by digit, from the least significant end, carrying as you go. The same loop solves Add Binary, Add Strings, and Add Two Numbers (with linked lists).

## Complexity

`O(n)` time in the worst case (all `9`s); usually the loop stops after a digit or two. The digits are updated in place, except in the all-`9`s case, which needs a new list of `n + 1` digits.

## Pitfalls

- Forgetting the all-`9`s case. `[9,9]` must become `[1,0,0]`, not `[0,0]`.
- Adding one to the last digit without carrying, which leaves a "digit" of `10`: `[2,5,10]`.
- Walking from the left. The carry starts at the last digit and moves left.
