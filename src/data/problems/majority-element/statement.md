# Majority Element

## The task

You're given a list of integers `nums` of length `n`. One value fills **more than half** of the positions — it appears more than `n / 2` times. Return that value.

The tests always contain such a value. "More than half" is strict: in a list of 6 numbers the majority needs at least 4 copies, and in a list of 7 it also needs at least 4.

## Examples

**Example 1**

```
nums = [6,2,6,2,6]   -> 6
```

`6` takes 3 of the 5 positions.

**Example 2**

```
nums = [9,9,5,5,5,5,9]   -> 5
```

The list starts with two `9`s, but `5` holds 4 of the 7 positions.

**Example 3**

```
nums = [-1]   -> -1
```

One number is a majority of one.

## Constraints

- `1 <= nums.length <= 5 * 10^4`
- `-10^9 <= nums[i] <= 10^9`
- Some value appears more than `n / 2` times.

## Aim for

Counting every value with a dictionary is `O(n)` time and `O(n)` space — a perfectly good first answer, so say it. Then aim for `O(1)` extra space in a single pass, keeping just one *candidate* value and one counter. The idea to chase: let each copy of a value cancel out one copy of a different value. The majority has more copies than all the other values put together, so think about who is left standing at the end.

## Follow-ups

- The tests stop promising that a majority exists. How do you confirm that the value you found really is one?
- Find every value that appears more than `n / 3` times. How many such values can there be?
- Sorting also solves it in one line. Which index of the sorted list must hold the majority, and why?
