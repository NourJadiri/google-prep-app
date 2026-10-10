## Approach

One decision per digit: which of its letters to use. Backtracking walks those decisions in order.

```
backtrack(i):
    if i == len(digits):
        record "".join(path)
        return
    for ch in KEYS[digits[i]]:
        path.append(ch)        # choose
        backtrack(i + 1)       # explore the next digit
        path.pop()             # un-choose
```

Every letter choice leads to a valid string, so there's nothing to prune: the search tree *is* the answer, one leaf per combination. It's correct because each combination is exactly one sequence of letter choices, and the loop offers every letter at every digit.

The empty input is the edge case that bites. With zero digits the recursion hits its base case at once and records `""`, but the task says an empty input has no combinations. Return `[]` before starting.

The iterative version is worth mentioning: `out = [""]`, then for each digit `out = [s + ch for s in out for ch in KEYS[d]]`. Same output, same complexity, and it needs the same guard for the empty input.

Keep the keypad as data, a dict or a list indexed by digit. Deriving letters arithmetically (`'a' + 3 * (d - 2)`) is a trap: `7` and `9` have four letters, and the extra `s` after `7` shifts every key that follows.

## Complexity

With at most four letters per digit there are at most `4^n` combinations of length `n`: `O(n · 4^n)` time to build them and `O(n)` extra space for the path and the recursion. For `n <= 4` that is at most 256 strings.

## Pitfalls

- Returning `[""]` for empty `digits`.
- Computing letters arithmetically instead of from a table: `7` (`pqrs`), `8` and `9` (`wxyz`) come out wrong.
- Sharing one list across branches and recording it without joining or copying.
