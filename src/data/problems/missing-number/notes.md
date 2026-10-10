## Approach

**The pattern: expected minus actual.** You know exactly what a complete list would contain — every number from `0` to `n` — so you know its **sum** without looking at the list: `0 + 1 + … + n = n * (n + 1) / 2`. Add up the numbers you actually have. Whatever the real total falls short by is the missing number.

```
nums = [4,0,3,1], n = 4
expected = 0 + 1 + 2 + 3 + 4 = 10    (or 4 * 5 / 2)
actual   = 4 + 0 + 3 + 1     =  8
missing  = 10 - 8            =  2
```

Where does the formula come from? Write the numbers forwards and backwards and add them in columns: `0 + n`, `1 + (n - 1)`, `2 + (n - 2)`, … — every column adds up to `n`, and there are `n + 1` columns. That counts every number twice, so the sum is `n * (n + 1) / 2`.

The two edge cases need no special code. If `n` is the missing one, the difference is `n`; if `0` is the missing one, the difference is `0`. In Python, use `//` so the answer stays an integer.

**The XOR version** reuses the trick from Single Number. XOR together every index `0` to `n` *and* every value in the list. Each number that's present shows up twice — once as an index, once as a value — and cancels itself out. The missing number shows up only once, as an index, so it's all that's left. In Java or C++, where a big sum can overflow, XOR is the safer choice; Python's integers never overflow, so the sum is fine here.

Other correct answers worth mentioning on the way: sort and find the first index `i` where `nums[i] != i` (`O(n log n)`), or put the numbers in a set and check `0` to `n` one by one (`O(n)` space).

**Spotting it next time:** "the numbers `0` to `n` (or `1` to `n`), with one missing, one extra or one duplicated" means: compare against what the complete range would give you — its sum, its XOR, or (in harder problems) using each value as an index.

## Complexity

`O(n)` time: one pass to add up the list. `O(1)` extra space: just a couple of numbers.

## Pitfalls

- The sorted scan that returns the first `i` with `nums[i] != i` — and returns nothing when every position matches, which is exactly the case where `n` is missing, as in `[0,1,2]`.
- An off-by-one in the formula. The range `0` to `n` has `n + 1` numbers, so the sum is `n * (n + 1) / 2`, not `n * (n - 1) / 2`.
- Only looking for a gap between neighbours after sorting. `[1,2]` has no gap, yet `0` is missing.
