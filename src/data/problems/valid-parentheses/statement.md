# Valid Parentheses

## The task

You're given a string `s` made only of the six bracket characters `(`, `)`, `[`, `]`, `{` and `}`. Return `True` if its brackets are balanced and `False` if they aren't.

The brackets are balanced when all three of these hold:

- Every closer has the same kind as the opener it closes: `)` closes `(`, `]` closes `[`, `}` closes `{`.
- Brackets close in the reverse of the order they were opened, so a closer always belongs to the most recent opener that is still open.
- Nothing is left over: every opener gets closed, and no closer turns up when there's nothing open for it to close.

## Examples

**Example 1**

```
s = "[{()}]()"   -> true
```

Pairs can sit inside each other and next to each other.

**Example 2**

```
s = "{(})"   -> false
```

Each kind is opened once and closed once, but `}` arrives while `(` is still the most recent open bracket. The two pairs cross.

**Example 3**

```
s = "(()"   -> false
```

The first `(` is never closed. A string like `"())"` fails for the opposite reason: its last `)` has nothing left to close.

## Constraints

- `1 <= s.length <= 10^4`
- `s` contains only the characters `()[]{}`.

## Aim for

One pass from left to right, `O(n)` time. Notice that the only bracket you're allowed to close next is the one you opened most recently. So keep the still-open brackets somewhere that hands you the newest one first. Then work out two edge cases: what should happen when a closer arrives and nothing is open, and what has to be true when you reach the end?

## Follow-ups

- Return the index of the first character that breaks the balance, or `len(s)` if the only problem is openers left at the end.
- If there's only one kind of bracket, `(` and `)`, can you do it in `O(1)` extra space?
- What's the smallest number of brackets you'd have to insert to balance the string?
