# Plus One

## The task

A non-negative integer is stored as the list of its decimal digits, `digits`, most significant digit first: `[4,0,7]` stands for `407`. There are no leading zeros, except that the number zero is written as `[0]`.

Add one to the number and return the result in the same form.

## Examples

**Example 1**

```
digits = [2,5,9]   -> [2,6,0]
```

`259 + 1 = 260`: the `9` rolls over to `0` and carries `1` into the `5`.

**Example 2**

```
digits = [9,9]   -> [1,0,0]
```

Every digit carries, so the answer is one digit longer than the input.

**Example 3**

```
digits = [0]   -> [1]
```

## Constraints

- `1 <= digits.length <= 100`
- `0 <= digits[i] <= 9`
- No leading zeros, except for the number zero itself, `[0]`.

## Aim for

Do what you'd do on paper: start at the last digit and carry to the left. Where does the carry stop, and what happens if it never stops? `O(n)` time. Python could turn the digits into an `int` and back, but be ready to say why that wouldn't work in most languages, and why it isn't what the interviewer wants to see.

## Follow-ups

- Add two numbers stored this way.
- The digits come in a singly linked list, most significant first. How do you carry backwards through it?
- Subtract one instead. Which inputs need extra care?
