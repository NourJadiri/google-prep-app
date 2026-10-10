# First Bad Version

## The task

Your team has shipped versions `1, 2, ..., n` of a product, and one of them introduced a bug. Every version built after a bad version is also bad. So the versions run good, good, ..., good, bad, bad, ..., bad, and at least one of them is bad.

You can't inspect the versions directly. Instead, a function `isBadVersion(version)` is already defined for you. Call it as a plain function, not as a method. It returns `True` if that version is bad. Each call is expensive, so find the first bad version using as few calls as you can.

Your method receives only `n`. In the examples and tests, `bad` is the first bad version. The tests use it to build `isBadVersion`, and it isn't passed to your method. The tests also count your calls: making more than `2 * ceil(log2(n)) + 2` of them fails the test. For `n = 8` that limit is 8 calls, and for `n` near two billion it's 64.

## Examples

**Example 1**

```
n = 8, bad = 6   -> 6
```

Here's one way to get there. `isBadVersion(4)` is `False`, so the first bad version comes after 4. `isBadVersion(6)` is `True`, so it's 6 or earlier. `isBadVersion(5)` is `False`, so the answer is 6. That's three calls.

**Example 2**

```
n = 3, bad = 1   -> 1
```

Every version is bad, so the answer is the very first one.

**Example 3**

```
n = 2147483647, bad = 1702766719   -> 1702766719
```

Checking versions one at a time would take about 1.7 billion calls. Halving the range each time takes 31.

## Constraints

- `1 <= bad <= n <= 2^31 - 1`

## Aim for

The versions form a sorted line of answers: `False, False, ..., False, True, True, ..., True`. You want the boundary, which is the first `True`, and binary search is built for finding boundaries like that. Each call tells you which side of the boundary you're on, so you can rule out half of the versions that are left. Think carefully about one case: when the middle version is bad, could it be the answer itself? Your answer decides how you update your bounds. That's `O(log n)` calls and time, and `O(1)` space.

## Follow-ups

- In a language with 32-bit integers, `(lo + hi) / 2` can overflow when `n` is close to `2^31`. How do you compute the midpoint safely?
- You don't know `n`. The versions just keep going, and all you know is that some version is bad. How do you find a range to search first?
- Each check takes an hour, and you have four machines that can test versions at the same time. How would you split the work?
