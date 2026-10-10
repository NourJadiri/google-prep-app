## Approach

This is backtracking on a grid: a depth-first search over paths, where each step either matches the next letter or gives up immediately.

`dfs(r, c, i)` answers one question: does `word[i:]` start at cell `(r, c)`, using only cells that aren't already on the current path? If the cell's letter isn't `word[i]`, the answer is no. If it's the last letter, the answer is yes. Otherwise, **borrow** the cell, try its four neighbours with `i + 1`, and then **give the cell back**. The reference borrows a cell by overwriting it with `#`, which can't match any letter, and gives it back by writing the letter in again. The outer loop tries every cell as a starting point and stops at the first success.

Giving the cell back is the heart of it. The "used" mark belongs to the *current path*, not to the search as a whole. When a branch fails, the cells it borrowed must be returned, because another branch, or another starting cell, may need them. Forget to return them, and early dead ends silently block the real path.

Why not keep one visited set for the whole search, as in a flood fill? A flood fill asks "is this cell reachable?", and once that's answered it never changes. Here the question is "is this cell free *on this path*?", and the answer changes every time you backtrack.

The reference adds two cheap prunes worth mentioning in an interview. First, if the board doesn't hold each letter at least as many times as the word does, no search can succeed. Second, if the word's first letter is more common on the board than its last, search for the reversed word instead. The search tree is narrowest at the rare letter, so put that letter at the root. On a board of all `A`s with a single `B`, the word `"AAA…AB"` costs the plain search hundreds of thousands of calls; reversed, it takes a few dozen.

## Complexity

`O(m·n·3^L)` time in the worst case: `m·n` starting cells, and after the first step each step has at most three new directions, since the path can't step back onto the cell it came from. `O(L)` space for the recursion. The pruning doesn't change the worst case, but it removes the worst inputs in practice.

## Pitfalls

- Not unmarking a cell after exploring from it, so cells used by a failed path stay blocked.
- Letting a path reuse a cell, as in Example 3.
- Indexing `word[i]` before checking whether `i == len(word)`. On a full match, that reads past the end of the word.
- Treating `"a"` and `"A"` as the same letter.
