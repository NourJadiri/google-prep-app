## Approach

A partition is a sequence of decisions: where does the next piece end? From position `start`, the piece `s[start..end]` is a legal choice only if it is a palindrome, and that test is the pruning.

```
backtrack(start):
    if start == n:
        record path[:]
        return
    for end in range(start, n):
        if not pal[start][end]: continue      # prune: not a palindrome
        path.append(s[start:end + 1])         # choose
        backtrack(end + 1)                    # explore the rest
        path.pop()                            # un-choose
```

It's correct because each partition is exactly one sequence of piece choices, and the loop offers every palindromic piece at every position. Pruning discards only pieces that could never appear in an answer, so nothing valid is lost.

**The palindrome table.** Checking `piece == piece[::-1]` costs `O(n)` every time. Precompute instead: `pal[i][j]` is true when `s[i] == s[j]` and the inside `s[i+1..j-1]` is a palindrome (or has fewer than two characters). Because `pal[i][j]` reads `pal[i + 1][j - 1]`, fill `i` from **right to left**, so the inner entry is always ready. Fill it in the other order and every palindrome longer than two characters is missed. The table costs `O(n^2)` time and space, once.

## Complexity

The worst case is a string of equal letters: each of the `n - 1` gaps can be cut or not, giving `2^(n-1)` partitions, each `O(n)` to copy. That's `O(n · 2^n)` time, the size of the output. The table takes `O(n^2)` space; the recursion and the path take `O(n)`.

## Pitfalls

- Filling the DP table in the wrong order, so `pal[i + 1][j - 1]` is read before it has been computed.
- Off-by-one slices: the piece ending at index `end` is `s[start:end + 1]`.
- Recording `path` itself instead of a copy.
