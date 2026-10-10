## Approach

**The O(n^2) DP.** The trick is a subproblem that remembers enough to extend. "The LIS of the first `i` elements" doesn't: to append `nums[i]` you need to know what the subsequence *ends* with. So pin the end.

- **Subproblem:** `dp[i]` = the length of the longest strictly increasing subsequence that ends exactly at index `i`.
- **Recurrence:** such a subsequence is either `nums[i]` alone, or one ending at some earlier `j` with `nums[j] < nums[i]`, extended by `nums[i]`. So `dp[i] = 1 + max(dp[j] for j < i if nums[j] < nums[i])`, or `1` when no `j` qualifies.
- **Base case:** every element alone gives `dp[i] = 1` — built into the "or 1".
- **Fill order:** `i` left to right; `dp[i]` reads only earlier entries.
- **Answer:** `max(dp)`, because the best subsequence can end anywhere.

```python
dp = [1] * len(nums)
for i in range(len(nums)):
    for j in range(i):
        if nums[j] < nums[i]:
            dp[i] = max(dp[i], dp[j] + 1)
return max(dp)
```

Top-down, flip the direction: `longest_from(i)`, the longest increasing subsequence *starting* at `i`, is `1 + max(longest_from(j))` over later `j` with `nums[j] > nums[i]`; cache it and take the max over every `i`. Each call recurses only to a larger value, so the depth never exceeds the answer.

**O(n log n): keep the best possible tails.** Scan left to right maintaining `tails`, where `tails[k]` is the smallest value that ends any increasing subsequence of length `k + 1` seen so far. A smaller tail is never worse: anything that could extend a subsequence ending in a bigger value can extend the one ending in a smaller value too.

`tails` is strictly increasing — a subsequence of length `k + 2` ending at `tails[k + 1]` has a length-`(k + 1)` prefix ending in something smaller, so `tails[k] < tails[k + 1]` — which makes room for binary search. For each `x`:

- If `x` is bigger than every tail, it extends the longest subsequence: append it.
- Otherwise find the first tail `>= x` with `bisect_left`, say at index `k`. The tail before it is `< x`, so `x` can end a subsequence of length `k + 1`, and `x` is no bigger than the current `tails[k]`: replace it.

The answer is `len(tails)`. Two things to notice. First, `tails` is generally *not* an increasing subsequence of `nums` — its entries come from different candidates; only its length means anything. To recover an actual subsequence, record for each element which element it was placed after. Second, `bisect_left` is what makes it strict: an `x` equal to a tail replaces that tail instead of extending past it. With `bisect_right` you get the longest *non-decreasing* subsequence.

This is patience sorting in disguise: deal the numbers onto piles, each onto the leftmost pile whose top is `>= x`. `tails` is the row of pile tops, and the number of piles is the answer.

## Complexity

The DP: `O(n^2)` time — about three million comparisons at `n = 2500`, which is fine — and `O(n)` space. The tails method: `O(n log n)` time, one binary search per element, and `O(n)` space at worst (`tails` is as long as the answer).

## Pitfalls

- Returning `dp[-1]`: the longest subsequence needn't end at the last element (`[1,2,3,4,0]`).
- `bisect.bisect(tails, x)` is `bisect_right` under another name, and it lets equal values extend: `[5,5,5]` comes out as 3.
- Treating `tails` as the subsequence itself.
- Greedy "take the next bigger number": on `[2,9,3,4,1,5]` it takes the 9 and stalls at length 2.
