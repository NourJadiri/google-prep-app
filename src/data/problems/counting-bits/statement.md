# Counting Bits

## The task

Given a non-negative integer `n`, return a list `ans` of length `n + 1` where `ans[i]` is the number of `1` bits in the binary form of `i`, for every `i` from `0` to `n`.

## Examples

**Example 1**

```
n = 6   -> [0,1,1,2,1,2,2]
```

In binary, 0 to 6 are `0`, `1`, `10`, `11`, `100`, `101`, `110`. Count the 1s in each.

**Example 2**

```
n = 0   -> [0]
```

Just the number 0, which has no 1 bits — but the list still has `n + 1 = 1` entry.

**Example 3**

```
n = 8   -> [0,1,1,2,1,2,2,3,1]
```

`7` is `111`, three 1s; `8` is `1000`. Reaching a power of two drops the count back to a single 1.

## Constraints

- `0 <= n <= 10^5`

## Aim for

Counting the bits of each number separately is `O(n log n)` — a fine start, but aim for `O(n)` without any built-in bit counting. For each `i`, look for a *smaller* number whose count you already have and whose bits differ from `i`'s in a simple way. Shifting right by one (`i >> 1`) drops exactly the last bit of `i`: how many 1s could that have removed?

## Follow-ups

- Do it in one pass without built-in bit counting (`bin(i).count`, `int.bit_count`).
- `i & (i - 1)` clears the lowest 1 bit of `i`. Write the recurrence with that instead.
- Return the total number of 1 bits across all of `0..n`, for `n` up to `10^18`.
