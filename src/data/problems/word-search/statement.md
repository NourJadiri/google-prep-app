# Word Search

## The task

You're given an `m x n` grid of letters `board` and a string `word`. Return `true` if `word` can be traced on the board. To trace it, start on any cell holding its first letter, then step each time to an edge-adjacent cell (up, down, left or right) holding the next letter. No cell may be used twice in the same path. Upper- and lowercase letters are different.

## Examples

**Example 1**

```
board = [["P","L","O","S"],
         ["E","A","T","R"],
         ["S","N","E","A"]], word = "PLANET"   -> true
```

Go right from `P` to `L`, down to `A` and `N`, right to `E`, then back up to `T`.

**Example 2**

```
board = [["P","L","O","S"],
         ["E","A","T","R"],
         ["S","N","E","A"]], word = "SEAS"   -> false
```

Every letter of `SEAS` is on the board, but not in a connected order. The bottom-left `S` leads to `E` and then `A`, but no second `S` touches that `A`. The other `S` has no `E` beside it.

**Example 3**

```
board = [["A","B"]], word = "ABA"   -> false
```

The path would have to step back onto the `A` it started from.

## Constraints

- `m == board.length`, `n == board[i].length`
- `1 <= m, n <= 6`
- `1 <= word.length <= 15`
- `board` and `word` contain only English letters, upper- and lowercase.

## Aim for

Backtracking DFS. From each cell that matches `word[0]`, try to extend the path one letter at a time. Mark the current cell as used while you explore from it, and **unmark it when you return**, so other paths can use it. Stop at the first full match. This takes `O(m·n·3^L)` time for a word of length `L` (after the first step, each cell has at most three unused neighbours) and `O(L)` recursion depth.

## Follow-ups

- Find every word from a list of thousands, all at once. What can the searches share?
- Prune before you search: what can a letter count tell you, and why might you search for the word backwards?
- Allow diagonal steps. What happens to the bound?
