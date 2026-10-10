## Approach

**When is it possible?** Picture `n` slots. Copies of one letter can't touch, so at most every other slot can hold the same letter: positions `0, 2, 4, …`, which is `ceil(n/2)` slots, `(n + 1) // 2` in Python. A letter that occurs more often than that can't be placed — return `""`. The converse, that every string within the bound has an answer, is what the greedy below proves by building one.

**Greedy with a max-heap.** Repeatedly place the letter with the most copies left, with one restriction: the letter just placed sits out one turn.

1. Pop the letter with the largest remaining count and append it.
2. Push back the letter that sat out last turn, if any.
3. The letter just placed, its count reduced, sits out next turn — unless it's used up.

Why the most plentiful letter? It's the one in danger. Its copies need separators, and spending the other letters first would leave it clumped at the end. Spending the largest count first keeps the counts as level as the slots allow, and with that rule the greedy never gets stuck on a string that passed the up-front check.

`heapq` is a min-heap, so the entries are `(-count, letter)`.

**Slot dealing, `O(n)`.** Sort the letters by count, most frequent first, and write them into positions `0, 2, 4, …`, wrapping round to `1, 3, 5, …` when the even positions run out. Copies of one letter land two apart. The most frequent letter fits entirely in the even slots, and a later letter that wraps can't land beside itself, because every letter dealt before it was at least as frequent and pushed its even run far enough right. Less code, but a subtler argument — the heap version is easier to defend at a whiteboard.

## Complexity

Heap: `O(n log k)` time for `k` distinct letters — with `k <= 26`, effectively `O(n)` — and `O(k)` extra space beside the output. Slot dealing: `O(n + k log k)`.

## Pitfalls

- The bound off by one: it's `(n + 1) // 2`, not `n // 2`. `"aba"` and `"x"` are perfectly fine.
- Picking the most frequent letter without making it sit out, so it lands twice in a row.
- Sorting the letters and interleaving the two halves: that works only when the crowded letter happens to sort first or last, and fails on `"abbc"`.
