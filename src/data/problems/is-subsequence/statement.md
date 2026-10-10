# Is Subsequence

## The task

Given two strings `s` and `t`, return `True` if `s` is a **subsequence** of `t`, and `False` otherwise.

`s` is a subsequence of `t` if you can turn `t` into `s` by deleting some of its characters (any number, including none) without changing the order of the ones that remain. Each letter of `s` has to be matched by its own letter of `t`, in the same left-to-right order. The empty string is a subsequence of every string, including the empty one.

## Examples

**Example 1**

```
s = "pin", t = "pigeon"   -> true
```

Delete `g`, `e` and `o` from `"pigeon"` and `"pin"` is what's left.

**Example 2**

```
s = "dog", t = "dragon"   -> false
```

Every letter of `"dog"` appears in `"dragon"`, but there the `g` comes before the `o`, and order matters.

**Example 3**

```
s = "", t = "abc"   -> true
```

Delete everything.

## Constraints

- `0 <= s.length <= 100`
- `0 <= t.length <= 10^4`
- `s` and `t` contain only lowercase English letters.

## Aim for

`O(len(t))` time and `O(1)` extra space, with two pointers: one in each string. Walk through `t` once, from left to right. When should the pointer in `s` move forward? And why is grabbing the first possible match never a mistake?

## Follow-ups

- `t` stays the same, but a billion different strings `s` arrive one at a time. How would you prepare `t` once so that each check is fast?
- Return how many letters of `s`, counting from the front, can be matched before `t` runs out.
- Count the number of different ways `s` can be picked out of `t`.
