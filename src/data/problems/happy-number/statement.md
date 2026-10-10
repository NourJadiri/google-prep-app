# Happy Number

## The task

Start with a positive integer `n`, and keep replacing it with the sum of the squares of its digits. If you eventually reach `1`, the number is **happy**: return `True`. If you never reach `1`, because the numbers start repeating in a loop that doesn't include `1`, return `False`.

Once you reach `1` you stay there, since `1^2 = 1`.

## Examples

**Example 1**

```
n = 7   -> true
```

`7 → 49 → 97 → 130 → 10 → 1`. (For instance, `4^2 + 9^2 = 97` and `9^2 + 7^2 = 130`.)

**Example 2**

```
n = 4   -> false
```

`4 → 16 → 37 → 58 → 89 → 145 → 42 → 20 → 4`, and round it goes forever without ever reaching `1`.

**Example 3**

```
n = 1   -> true
```

Already there.

## Constraints

- `1 <= n <= 2^31 - 1`

## Aim for

Simulating the process is easy. The real question is how to notice that it's going round in circles. Remembering every number you've seen in a set works. For `O(1)` extra space, picture each number pointing to the next one, like nodes in a linked list: you may already know a trick for spotting a loop in a linked list.

## Follow-ups

- Why can't the numbers keep growing forever? (How big can the digit-square sum of a 10-digit number be?)
- Return how many steps it takes to reach `1`, or `-1` if it never does.
- Compare the set and the two-pointer approach: what does each one cost here?
