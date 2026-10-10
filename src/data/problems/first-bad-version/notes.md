## Approach

**A boundary in a line of yes/no answers.** Line the versions up and write the answer to `isBadVersion` under each one: `False, False, False, True, True, True`. Every version after a bad one is bad, so all the `False`s come first and all the `True`s come after. There's exactly one place where the answers switch, and the first `True` is the boundary you're looking for.

Checking versions one by one would find it, but with `n` near two billion, that's billions of calls. Binary search finds a boundary like this in about `log2(n)` steps, which is 31 for two billion. Each answer tells you which side of the boundary you're on, so it rules out half of the versions that are left.

Use the same loop as Binary Search, with these promises (the invariant):

- Every version **before `lo`** is good.
- Every version **after `hi`** is bad.

Start with `lo = 1` and `hi = n`, since nothing is known yet. While `lo <= hi`:

1. Set `mid = (lo + hi) // 2`.
2. If `isBadVersion(mid)` is `True`, then `mid` and everything after it are bad, so set `hi = mid - 1`.
3. Otherwise `mid` and everything before it are good, so set `lo = mid + 1`.

When the loop stops, `lo == hi + 1`. Everything before `lo` is good and everything from `lo` on is bad, so `lo` is the first bad version. Return it.

But wait. When `mid` is bad, it might be *the* first bad version, and `hi = mid - 1` steps past it. Isn't that throwing the answer away? No. The promise "everything after `hi` is bad" still holds, so the answer is now `hi + 1`. The loop always ends with `lo == hi + 1`, so `lo` lands right on it. This is the same "the pointers cross at the boundary" idea as in Search Insert Position.

Here's a trace of Example 1, with `n = 8` and `bad = 6`:

- `lo = 1`, `hi = 8`, `mid = 4`. Version 4 is good, so `lo = 5`.
- `lo = 5`, `hi = 8`, `mid = 6`. Version 6 is bad, so `hi = 5`.
- `lo = 5`, `hi = 5`, `mid = 5`. Version 5 is good, so `lo = 6`.
- Now `lo` is bigger than `hi`, so return `6`. That took three calls.

**Another way to write it.** Many people use a different style: loop `while lo < hi`, set `hi = mid` when `mid` is bad (keeping it, since it might be the answer), and set `lo = mid + 1` when it's good. That loop ends with `lo == hi`, which is the answer. Both styles work. What breaks is mixing them. `while lo <= hi` combined with `hi = mid` never finishes, because once `lo == hi` on a bad version, nothing changes.

**Spotting it next time.** Whenever you can ask "is it this one or a later one?" and the answers go no, no, ..., yes, yes, you can binary search for the switch, even with no array in sight. Here it's versions hidden behind an API. In Sqrt(x), it'll be numbers whose squares are too big. People call this "binary search on the answer".

## Complexity

`O(log n)` time and `O(log n)` calls to `isBadVersion`, which is at most 31 for any `n` up to `2^31 - 1`. `O(1)` extra space.

## Pitfalls

- A linear scan. It gives the right answer, but it needs up to `n` calls, and the tests stop it as soon as it goes over the limit.
- Mixing loop styles, as described above. `while lo <= hi` with `hi = mid` loops forever once it reaches the answer.
- Midpoint overflow in Java, C++ or Go, where `lo + hi` can be bigger than `2^31 - 1`. Use `lo + (hi - lo) // 2` in those languages. Python's integers don't overflow, but interviewers like to hear that you know about it.
