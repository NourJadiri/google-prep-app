## Approach

**The pattern: dynamic programming.** This is the classic first DP problem, so let's build the idea from scratch. Dynamic programming fits problems where the answer for a big input can be assembled from answers to smaller inputs *of the same problem*, and those smaller answers are needed again and again. You describe a DP with three things:

1. **State** — what one subproblem is. Here: `ways(k)`, the number of ways to end up standing on step `k`.
2. **Recurrence** — how a state is built from smaller ones. Look at the *last* move onto step `k`. Either it was a 1-step, made from step `k - 1`, or a 2-step, made from step `k - 2`. Those two groups don't overlap, and together they cover every way, so `ways(k) = ways(k - 1) + ways(k - 2)`.
3. **Base cases** — the smallest states, answered directly, so the recurrence has somewhere to stop. `ways(1) = 1`, and `ways(0) = 1`: there's exactly one way to stand on the floor, which is to make no moves. If `ways(0) = 1` feels odd, test it: it gives `ways(2) = ways(1) + ways(0) = 2`, which is right (`1+1` and `2`).

**Why plain recursion is slow.** Translate the recurrence straight into code and `ways(5)` calls `ways(4)` and `ways(3)`; `ways(4)` calls `ways(3)` *again*, plus `ways(2)`; and so on down. The same small staircases are recomputed over and over, and the number of calls grows like the answer itself — roughly `1.6^n`. At `n = 45` that's billions of calls. Subproblems that *overlap* like this are the signal that DP will help.

**Fix 1 — memoization (top-down).** Keep the recursion, but remember each answer the first time you compute it, so every `ways(k)` is worked out only once:

```python
@cache
def ways(k):
    if k <= 1:
        return 1
    return ways(k - 1) + ways(k - 2)
```

**Fix 2 — tabulation (bottom-up).** Fill the answers in increasing order, so whatever a step needs is already there: `dp[0] = dp[1] = 1`, then `dp[k] = dp[k - 1] + dp[k - 2]` for `k` from 2 up to `n`.

**Fix 3 — keep only what you need.** Each answer uses just the two before it, so two variables can replace the whole table. That's the reference solution: walk `k` upward, sliding the pair `(ways(k - 2), ways(k - 1))` along by one each time.

You may recognise the numbers 1, 1, 2, 3, 5, 8, 13, … — it's the Fibonacci sequence.

**Why it's correct.** Every way to reach step `k` ends with exactly one last move, a 1-step or a 2-step, so splitting by that move counts every way exactly once. The base cases are right by inspection, and each larger answer is built only from correct smaller ones.

**Spotting it next time.** "How many ways…", "the fewest…", "the cheapest…", "the most…" over a sequence of choices, where fixing the last choice leaves a smaller copy of the same question — that's DP. Write down the state, the recurrence and the base cases *before* writing code; then choose top-down or bottom-up.

## Complexity

Memoized or tabulated: `O(n)` time and `O(n)` space. The two-variable version: `O(n)` time and `O(1)` space. Plain recursion without memoization: about `O(1.6^n)` time — exponential.

## Pitfalls

- Setting a table entry that might not exist: with `dp = [0] * (n + 1)`, writing `dp[2]` crashes when `n = 1`.
- Base cases off by one, which shifts the whole sequence: answering `1, 1, 2, 3, 5` for `n = 1, 2, 3, 4, 5` instead of `1, 2, 3, 5, 8`. Check `n = 1, 2, 3` by hand.
- Plain recursion without memoization: correct, but it runs out of time long before `n = 45`.
