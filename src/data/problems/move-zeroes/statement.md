# Move Zeroes

## The task

You're given a list of integers `nums`. Move every `0` to the end of the list, and keep all the other values in the order they started in.

Do it **in place**: rearrange `nums` itself instead of building a new list. Your function returns nothing. The tests look at `nums` after your call, and that's what the examples show as the output.

## Examples

**Example 1**

```
nums = [0,5,0,0,2,9]   -> [5,2,9,0,0,0]
```

The non-zero values keep their order (`5`, then `2`, then `9`), and all three zeros end up at the back.

**Example 2**

```
nums = [-2,7,0,-2]   -> [-2,7,-2,0]
```

Negative values are just non-zero values: they keep their order, and so do repeats like the two `-2`s.

**Example 3**

```
nums = [0,0]   -> [0,0]
```

Nothing but zeros, so there's nothing to move in front of them.

## Constraints

- `1 <= nums.length <= 10^4`
- `-2^31 <= nums[i] <= 2^31 - 1`

## Aim for

One pass, `O(n)` time and `O(1)` extra space. Picture two fingers on the list: one reads every element from left to right, and the other marks the slot where the next non-zero value belongs. What should happen when the reading finger lands on a non-zero?

## Follow-ups

- Can you skip writes that wouldn't change anything? Count how many writes your version makes on a list with no zeros.
- Move every copy of some value `val` to the end instead of the zeros.
- Put the zeros at the *front* instead, still keeping the other values in order.
