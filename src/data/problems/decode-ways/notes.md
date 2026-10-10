## Approach

Group the decodings by their **last letter**. That letter was written with either the last digit or the last two digits, nothing else. The two groups don't overlap, and together they cover every decoding. Remove the last letter and what's left is a decoding of a shorter prefix.

**Subproblem.** `ways[i]` = the number of decodings of the first `i` digits, `s[:i]`.

**Recurrence.**

- If `s[i-1]` is `1`–`9`, the last letter can be that single digit: add `ways[i-1]`.
- If `s[i-2:i]` is `10`–`26`, the last letter can be those two digits: add `ways[i-2]`.

A `0` is never a letter on its own and can never start a two-digit piece, so it has to be the second digit of `10` or `20`. The recurrence enforces that with no special case.

**Base case.** `ways[0] = 1`: the empty prefix decodes exactly one way, as nothing. That's what makes `"12"` come out as 2: one decoding through `ways[1]` (`1 2`) and one through `ways[0]` (`12`).

**Fill order.** Left to right. Each step reads only the previous two values, so two variables can replace the array, giving `O(1)` space.

**Top-down.** `count(i)` = decodings of `s[i:]`. It's `count(i + 1)` when `s[i] != '0'`, plus `count(i + 2)` when `s[i:i+2]` is `10`–`26`, with `count(n) = 1`. Without a memo this is exponential: on `"111…1"` it recomputes the same suffixes, exactly like naive Fibonacci. With a memo it's `O(n)`, `n` calls deep.

## Complexity

`O(n)` time, one pass. `O(1)` extra space with two rolling values, or `O(n)` with the full table or the memo.

## Pitfalls

- Accepting `"06"` as a two-digit piece. Check that the pair is in `10..26`, not just `<= 26`.
- Treating a lone `"0"` as a letter.
- The base case: with `ways[0] = 0`, every count collapses to zero.
- Plain recursion without a memo is correct but exponential on long runs of `1`s and `2`s.
