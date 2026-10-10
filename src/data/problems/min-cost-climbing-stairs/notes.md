## Approach

**Why greedy fails.** The obvious plan — always step to the cheaper of the next two steps — makes a choice that looks good *now* without asking what it costs *later*. In Example 2, `[1,3,4,6]`, the greedy climber leaves step 0 for step 1 (toll 3) rather than step 2 (toll 4); but from step 1 they still have to pay for step 2 or step 3, and end up at 8. Jumping straight to step 2 is dearer for one move and cheaper overall: 5. When the best move now depends on what comes after, reach for dynamic programming.

**The DP: state, recurrence, base cases.** It's the same recipe as Climbing Stairs.

1. **State.** `best(i)` = the cheapest total toll to *arrive* at position `i`. Positions run from `0` to `n`, and position `n` is the top.
2. **Recurrence.** The last climb into position `i` came either from `i - 1`, paying `cost[i - 1]`, or from `i - 2`, paying `cost[i - 2]`. However you reached that earlier position, the cheapest way to do it costs `best` of it, so `best(i) = min(best(i - 1) + cost[i - 1], best(i - 2) + cost[i - 2])`.
3. **Base cases.** `best(0) = best(1) = 0`: you may start on either one for free.
4. **Answer.** `best(n)` — the top.

What makes this work (and greedy unnecessary) is that *how* you reached a step never matters for what comes next — only what it cost. So the cheapest route to position `i` must continue the cheapest route to whichever position it came from. Best answers built from best sub-answers: that's the property DP relies on.

**Mechanics.** Fill `best` from left to right. Each entry needs only the two before it, so keep two variables, just as in Climbing Stairs — the `+` of counting has become a `min`, with tolls added along the way. Tracing Example 1, `[5,2,8,1]`:

- `best(0) = 0` and `best(1) = 0`
- `best(2) = min(0 + 2, 0 + 5) = 2`
- `best(3) = min(2 + 8, 0 + 2) = 2`
- `best(4) = min(2 + 1, 2 + 8) = 3`, the top.

**The same DP, top-down.** Define `climb(i)` = the cheapest toll from standing on step `i` to the top: `climb(i) = cost[i] + min(climb(i + 1), climb(i + 2))`, with `climb(i) = 0` once `i >= n`. The answer is `min(climb(0), climb(1))`, and with `@cache` it's `O(n)` as well. It's the same idea read from the other end of the staircase.

**Why it's correct.** Every route to the top ends with a climb from `n - 1` or from `n - 2`, and the recurrence compares the cheapest route through each. By the same argument at every position, each `best(i)` is the true minimum, starting from the base cases, which are right by definition.

**Spotting it next time.** You want a minimum (or maximum) over a sequence of moves, and each move's options depend only on where you are, not on how you got there: "cheapest way to reach the end", "fewest jumps", "the most money you can take from houses in a row without taking two neighbours". Give each position its best value and build it from the positions that lead there.

## Complexity

`O(n)` time: one pass, constant work per position. `O(1)` extra space with two variables (`O(n)` with a full table or top-down memoization).

## Pitfalls

- Treating the last step as the top. The top is one past it, so from step `n - 2` you can jump clean over the last step without paying its toll.
- Forgetting that step 1 is a free start too, not just step 0.
- Greedy choices — the cheaper next step, the cheaper starting step. Example 2 and `[1,2,9,1]` break them.
