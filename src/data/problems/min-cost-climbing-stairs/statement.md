# Min Cost Climbing Stairs

## The task

A staircase has `n` steps, numbered `0` to `n - 1`, and each step has a toll: `cost[i]` for step `i`. Whenever you climb *off* step `i` you pay `cost[i]`, and that climb takes you up either 1 or 2 steps. You begin standing on step `0` or on step `1` — your choice, and getting there is free.

The goal is the top: the landing just above the last step (position `n`), which has no toll. Reaching it ends the climb; from step `n - 1`, a 1-step and a 2-step both get you there.

Return the minimum total toll needed to reach the top.

## Examples

**Example 1**

```
cost = [5,2,8,1]   -> 3
```

Start on step 1, pay 2 and climb two steps to step 3, then pay 1 and climb onto the top: `2 + 1 = 3`.

**Example 2**

```
cost = [1,3,4,6]   -> 5
```

Step 1 looks cheaper than step 2, but standing on it means paying again afterwards: `0 → 1 → 2` costs `1 + 3 + 4 = 8`. Better to pay 1 on step 0, jump straight to step 2, pay 4 and jump to the top: `1 + 4 = 5`.

**Example 3**

```
cost = [6,4]   -> 4
```

Start on step 1, pay 4 and climb one step to the top. Starting on step 0 would cost 6.

## Constraints

- `2 <= cost.length <= 1000`
- `0 <= cost[i] <= 999`

## Aim for

Always taking the cheaper next step looks tempting — Example 2 shows where it goes wrong. Instead, give every position one number: the cheapest total toll to *arrive* there. Which positions could you have just come from to arrive at position `i`, and what did that last climb cost? Work upward from the two free starting steps and read off the top's number: `O(n)` time, and `O(1)` space if you keep only the last two numbers.

## Follow-ups

- Also return the steps you stand on, for any cheapest route.
- You may climb up to `k` steps at a time. How fast can you make it? (`O(n * k)` is straightforward; a monotonic deque gets `O(n)`.)
- Turn it around: define the cheapest toll from standing on step `i` to the top, and solve it top-down. Why do both directions give the same answer?
