# Perfect Squares

## The task

Given a positive integer `n`, return the smallest number of perfect squares (`1, 4, 9, 16, …`) that add up to exactly `n`. A square may be used more than once.

## Examples

**Example 1**

```
n = 18   -> 2
```

`9 + 9`. Grabbing the biggest square first gives `16 + 1 + 1`, which is one term too many.

**Example 2**

```
n = 7   -> 4
```

`4 + 1 + 1 + 1`. No sum of three squares makes 7.

**Example 3**

```
n = 1   -> 1
```

`1` is a perfect square already.

## Constraints

- `1 <= n <= 10^4`

## Aim for

`O(n·√n)` time and `O(n)` space. Work bottom-up over `i = 1..n`: the last square in a best sum for `i` is some `s <= i`, so `fewest[i] = 1 + min(fewest[i - s])` over the `√i` squares. Breadth-first search over remainders reaches the same answer and stops at the first level that hits 0.

## Follow-ups

- Every positive integer is a sum of four squares, and exactly the numbers of the form `4^a(8b + 7)` need all four. Turn that into an `O(√n)` answer.
- Return the squares themselves, not just how many.
- You'll answer many queries with different `n <= 10^4`. What do you precompute?
