# Backspace String Compare

## The task

Two people type into identical text boxes that both start empty. You get the keys each one pressed as a string: `s` for the first box and `t` for the second. A lowercase letter types that letter. A `#` is the backspace key: it deletes the character just before it, and does nothing if the box is already empty.

Return `True` if both boxes end up showing exactly the same text, and `False` otherwise.

## Examples

**Example 1**

```
s = "abc#d", t = "abzz##d"   -> true
```

The first box goes `a`, `ab`, `abc`, `ab`, `abd`. The second types `abzz`, deletes both `z`s, then adds `d`. Both end at `"abd"`.

**Example 2**

```
s = "x#y#", t = "#"   -> true
```

Both boxes end up empty. The lone `#` in `t` presses backspace on an empty box, which does nothing.

**Example 3**

```
s = "bxj##tw", t = "bxj###tw"   -> false
```

One extra backspace makes all the difference. `s` ends as `"btw"`, while `t` deletes the `b` as well and ends as `"tw"`.

## Constraints

- `1 <= s.length, t.length <= 200`
- `s` and `t` contain only lowercase English letters and `#`.

## Aim for

A good first answer is to simulate each box. Build the final text in a list: a letter goes on the end, and `#` takes the last one off. That's `O(n + m)` time and `O(n + m)` space. Then aim for `O(1)` extra space by reading both strings from the end. Going backwards, you meet each `#` before the letter it deletes, so a running count of backspaces you still owe tells you which letters to skip.

## Follow-ups

- The keys arrive one at a time as a stream, and you can't go back and reread them. Which approach still works, and what does it cost?
- Add a second key, `<`, that moves the cursor one place left without deleting anything. How would you work out each box's final text now?
