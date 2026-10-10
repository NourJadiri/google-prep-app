# Valid Palindrome

## The task

Given a string `s`, decide whether it reads the same forwards and backwards **once you keep only its letters and digits** and ignore the difference between uppercase and lowercase. Return `True` if it does and `False` if it doesn't.

- Only letters (`a` to `z`, `A` to `Z`) and digits (`0` to `9`) count. Spaces, punctuation and every other symbol are skipped.
- `A` and `a` count as the same letter. Digits must match exactly.
- If nothing is left after skipping, the answer is `True`: an empty string reads the same both ways.

## Examples

**Example 1**

```
s = "Step on no pets!"   -> true
```

Keeping only the letters, in lowercase, gives `steponnopets`, which is the same reversed.

**Example 2**

```
s = "Madam, I'm 2 Adam"   -> false
```

Digits count. The cleaned-up string is `madamim2adam`, and the `2` has no partner on the other side.

**Example 3**

```
s = "?! ."   -> true
```

Nothing is left after skipping the symbols, and an empty string is a palindrome.

## Constraints

- `1 <= s.length <= 2 * 10^5`
- `s` contains only printable ASCII characters.

## Aim for

The easy version builds a cleaned-up copy — lowercase, letters and digits only — and compares it with its reverse: `O(n)` time and `O(n)` extra space. Say that first, then drop the copy: compare characters **from both ends at once**, moving inward and skipping anything that doesn't count as you go. Same `O(n)` time, but `O(1)` extra space.

## Follow-ups

- You may delete at most one character. Can the string be made into a palindrome?
- What has to change if `s` can contain letters from other alphabets, such as `É` or `Ж`?
