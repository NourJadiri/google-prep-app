# Combination Sum II

## The task

You're given a list of positive integers `candidates`, which may contain repeated values, and a positive integer `target`. Return every distinct combination of candidates that adds up to exactly `target`.

Each entry of `candidates` can be used at most once in a combination, so a value that appears `k` times in the list can appear up to `k` times in one combination. Two combinations are the same if they hold the same values the same number of times; return each only once. The combinations can come in any order, and so can the numbers inside each.

## Examples

**Example 1**

```
candidates = [3,1,3,5,1,4], target = 8   -> [[1,1,3,3],[1,3,4],[3,5]]
```

Both `1`s and both `3`s fit in one combination. `[1,3,4]` can be assembled from either `1` and either `3`, yet it is listed once.

**Example 2**

```
candidates = [6,6,6], target = 12   -> [[6,6]]
```

**Example 3**

```
candidates = [9,4], target = 3   -> []
```

Every candidate is bigger than the target.

## Constraints

- `1 <= candidates.length <= 100`
- `1 <= candidates[i] <= 50`
- `1 <= target <= 30`

## Aim for

Sort, then backtrack on `(start, remaining)`: choose `candidates[i]` for some `i >= start`, explore from `i + 1`, un-choose. Two prunings make it fast. Skip `candidates[i]` when `i > start` and it equals `candidates[i - 1]`, because that value already had its turn in this slot. And `break` at the first candidate bigger than `remaining`. Never generate duplicates and filter them afterwards: on a hundred `1`s that explores an astronomical number of branches to find a single answer.

## Follow-ups

- Every candidate may be reused any number of times, and they're distinct (Combination Sum).
- Only combinations of exactly `k` numbers drawn from `1` to `9` (Combination Sum III).
- Just count the combinations. Which DP replaces the search?
