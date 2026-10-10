# Sqrt(x)

## The task

Given a non-negative integer `x`, return its square root rounded down to a whole number. In other words, return the largest integer `k` with `k * k <= x`.

Don't use a built-in square root or power function: no `math.sqrt`, `math.isqrt`, `x ** 0.5` or `pow(x, 0.5)`. The point is to work the answer out yourself. (The tests can't tell what you used, so this rule is on your honour.)

## Examples

**Example 1**

```
x = 50   -> 7
```

`7 * 7 = 49` fits under 50, but `8 * 8 = 64` doesn't. The real square root is about 7.07, which rounds down to 7.

**Example 2**

```
x = 81   -> 9
```

81 is a perfect square: `9 * 9` is exactly 81.

**Example 3**

```
x = 0   -> 0
```

Zero is its own square root, so your search has to be able to land on `0`.

## Constraints

- `0 <= x <= 2^31 - 1`

## Aim for

Trying `k = 0, 1, 2, ...` until `k * k` goes past `x` works, but it takes about `sqrt(x)` steps, which is over 46,000 for the largest `x`. Look at the question "is `k * k <= x`?" as `k` grows: the answers go yes, yes, ..., yes, no, no. You want the last yes. That's a boundary in a sorted line of answers, and finding boundaries like that is exactly what binary search does. Make sure the range you start searching covers the answer for every `x`, including `0` and `1`. That's `O(log x)` time and `O(1)` space.

## Follow-ups

- Return the square root to within `10^-6` instead of rounding down.
- Newton's method finds square roots very quickly. How does it work, and how fast does it close in on the answer?
- Decide whether `x` is a perfect square, still without any built-in square root function.
