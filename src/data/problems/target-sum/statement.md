# Target Sum

## The task

You're given a list of non-negative integers `nums` and an integer `target`. Put a `+` or a `-` sign in front of every number, then add everything up. With `n` numbers there are `2^n` sign patterns; return how many of them add up to exactly `target`.

Patterns are told apart by position: flipping the sign of a different element gives a different pattern even when the values are equal, so `+0` and `-0` count as two patterns.

## Examples

**Example 1**

```
nums = [2,1,1], target = 2   -> 2
```

`+2 +1 -1` and `+2 -1 +1`. The two 1s sit at different positions, so these are two different patterns.

**Example 2**

```
nums = [0,3], target = 3   -> 2
```

`+0 +3` and `-0 +3`: a zero can take either sign, which doubles the count.

**Example 3**

```
nums = [3,4], target = 2   -> 0
```

The four totals are 7, -1, 1 and -7. Flipping a sign changes the total by an even amount, so with `3 + 4 = 7` only odd targets are reachable.

## Constraints

- `1 <= nums.length <= 50`
- `0 <= nums[i] <= 1000`
- `0 <= sum(nums) <= 1000`
- `-1000 <= target <= 1000`

## Aim for

Trying all `2^n` sign patterns is fine for 20 numbers and hopeless for 50 (LeetCode stops at 20; this version doesn't). Two DPs work. Direct: count how many ways each running total can be reached, one number at a time — totals stay within `[-sum, sum]`, so that's `O(n · sum)`. Slicker: if the plus-signed numbers add up to `P`, then `P - (total - P) = target`, so `P = (total + target) / 2`. If that isn't a whole number in `[0, total]` the answer is 0; otherwise count the subsets that sum to `P` with a 1D array swept downward. `O(n · total)` time, `O(total)` space.

## Follow-ups

- Return one sign pattern that works, instead of the count.
- Why must the subset-count loop run downward, and what happens to zeros if it stops at `s > x` instead of `s >= x`?
- Count the ways to split the numbers into two groups whose sums differ by exactly `d`. Why is that the same problem?
