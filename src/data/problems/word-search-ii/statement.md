# Word Search II

## The task

You get a grid of letters `board` (`m` rows, `n` columns) and a list of distinct `words`. Return every word from the list that can be traced on the board.

To trace a word, start on a cell holding its first letter and keep stepping to a cell directly above, below, left or right of the current one (never diagonally), each new cell holding the next letter. Within one word, no cell may be used twice. Different words may use the same cells.

Return each traceable word exactly once, in any order.

## Examples

**Example 1**

```
board = [["s","e","a","t"],
         ["n","o","t","e"],
         ["d","i","r","s"]]
words = ["seat","sea","note","tot","dirt","rose"]
                                       -> ["dirt","note","sea","seat"]
```

`sea` and `seat` share their first three cells. `tot` would need the only `t` beside the `o` twice, and no `o` sits beside the `r`, so `rose` is out.

**Example 2**

```
board = [["a","b"],
         ["b","a"]]
words = ["ab","abba","aa","abab"]
                          -> ["ab","abab"]
```

`ab` can be traced along four different paths but is listed once. The two `a`s touch only diagonally, and so do the two `b`s, so neither `aa` nor `abba` can be traced.

**Example 3**

```
board = [["z"]], words = ["zz","z"]   -> ["z"]
```

One cell can't supply both letters of `zz`.

## Constraints

- `m == board.length`, `n == board[i].length`
- `1 <= m, n <= 12`
- `board[i][j]` is a lowercase English letter.
- `1 <= words.length <= 3 * 10^4`
- `1 <= words[i].length <= 10`
- `words[i]` consists of lowercase English letters, and all the words are distinct.

## Aim for

Running Word Search once per word repeats the same walks for every word that shares a beginning — say it, then fix it. Put the words in a trie and run one backtracking DFS from each cell, stepping through the trie as you step across the board, so a path survives only while it spells some word's prefix. Keep the whole word on its end node and clear it once reported (no duplicates), and prune trie branches that have nothing left to find. Building the trie is `O(total letters)`; the search is `O(m * n * 3^L)` in the worst case for words of length up to `L`, however many words there are, and pruning makes typical boards far cheaper.

## Follow-ups

- The board is fixed and word lists keep arriving. What would you precompute?
- What changes if a cell may be reused within a word?
- Return, for each word found, one sequence of cells that spells it.
