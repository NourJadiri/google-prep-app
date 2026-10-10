## Approach

Start from the one-word version, Word Search: backtracking from a starting cell, trying each neighbour that holds the next letter, marking cells on the current path so none is used twice and unmarking them on the way back. Running that once per word works, but it wastes effort: `sea` and `seat` walk the same cells, and when thousands of words share their first few letters, repeating those walks is nearly all the work.

A trie of the words removes the repetition. Run one DFS from each cell and move through the trie as you move across the board: stepping onto a cell with letter `ch` means stepping from the current trie node to its child `ch`. If there is no such child, no word continues this way and the path ends. Every path on the board is now walked at most once, no matter how many words share it.

Three details make it right and fast:

1. **Mark, explore, unmark.** Overwrite the current cell with `#` before visiting its neighbours and restore the letter afterwards. The path can't reuse a cell, and the cell is free again for every other path.
2. **Keep the word on its end node, and clear it when found.** Reaching a node whose `word` is set means the current path spells that word. Record it and set `word` back to `None`, so a word that can be traced a hundred ways is reported once, with no path to rebuild.
3. **Prune.** After exploring a node, if it has no children and no word left to report, delete it from its parent. Branches whose words have all been found disappear, so later starts don't walk them again. On a board of all `a`s with the words `a` through `aaaaaaaaaa`, the first deep path finds every word and pruning deletes the whole trie on the way back. Without pruning, the search would go on to walk millions of paths that can't find anything new.

Why it's correct: the search follows every path that never repeats a cell, for as long as the path's letters spell the start of a word that hasn't been reported yet. Pruning only deletes branches that have nothing left to report, so no word that can still be found is lost. So a word is reported exactly when some path spells it, and clearing `word` means it's reported only once.

## Complexity

Building the trie is `O(total letters in words)`. From each starting cell, a path takes at most 4 choices for its first step and at most 3 after that (it never steps back onto the cell it just left). So the search is `O(m * n * 4 * 3^(L-1))` for words up to `L = 10` letters, whatever the number of words. Dead ends in the trie and pruning keep real runs far below that. Space is `O(total letters)` for the trie plus `O(L)` for the recursion.

## Pitfalls

- Reporting a word every time a path reaches it. Clear the node's `word` (or collect into a set): a word you can trace along two paths must appear once.
- Forgetting to restore the cell after exploring it. Later starts find the board full of `#` and miss words.
- Stopping the walk when a word is found. Finding `sea` must not keep the search from going on to `seat`.
- Running Word Search once per word. It's correct, but it walks shared prefixes over and over, and one of the large tests is built so that it runs out of time.
