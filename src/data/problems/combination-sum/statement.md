# Combination Sum

## The task

You're given a list of **distinct** positive integers `candidates` and a positive integer `target`. Return every distinct combination of candidates whose sum is exactly `target`. Any candidate may be used as many times as you like.

Two combinations are the same if they use every candidate the same number of times, so `[2,2,3]` and `[3,2,2]` are one combination: return it once. The combinations can come in any order, and so can the numbers inside each.

## Examples

**Example 1**

```
candidates = [3,4,5], target = 11   -> [[3,3,5],[3,4,4]]
```

**Example 2**

```
candidates = [5,2,3], target = 9   -> [[2,2,2,3],[2,2,5],[3,3,3]]
```

The input isn't sorted, and `2` appears three times in the first combination.

**Example 3**

```
candidates = [4], target = 10   -> []
```

Fours make `8` and `12`, never `10`.

## Constraints

- `1 <= candidates.length <= 30`
- `2 <= candidates[i] <= 40`
- All the candidates are distinct.
- `1 <= target <= 40`
- The answer has fewer than `150` combinations.

## Aim for

Backtracking that builds each combination in exactly one order, non-decreasing, so duplicates never arise. Sort, then `backtrack(start, remaining)` tries `candidates[i]` for each `i >= start` and recurses from the **same** `i` (it may repeat): choose, explore, un-choose. Because the list is sorted, `break` as soon as a candidate exceeds `remaining`. Building every ordering and de-duplicating afterwards is the trap: with small candidates and `target = 40`, millions of orderings hide behind fewer than 150 combinations.

## Follow-ups

- Each candidate may be used at most once, and the list may repeat values (Combination Sum II).
- Only count the combinations: an unbounded-knapsack DP in `O(n · target)`.
- Count *orderings* instead, so `[2,3]` and `[3,2]` both count. Which single change to that DP does it?
