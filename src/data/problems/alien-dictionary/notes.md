## Approach

Two phases: read the rules out of the list, then topologically sort the letters.

**Rules.** Compare each word only with the next one. Walk both until the first position where they differ: if `a[i] != b[i]`, the list tells you exactly one thing — `a[i]` comes before `b[i]` — and nothing about any later position (once the words differ, the rest can be anything). If no position differs, the shorter word must come first; a longer word followed by its own prefix (`"ab"` then `"a"`) can't be explained by any alphabet, so return `""` on the spot. Adjacent pairs are enough: the list is sorted, so `w1 <= w2 <= w3` already implies `w1 <= w3`, and any rule a far-apart pair would give follows from the chain of rules between them.

**Order.** Letters are nodes, rules are edges `x -> y`. Every letter that appears in any word is a node, even with no edges — it still has to be in the answer. Run Kahn's algorithm: put every letter with indegree `0` in a queue; repeatedly pop one, append it to the answer, and decrement the indegree of each letter it points to, queueing those that reach `0`. A letter is emitted only after everything that must precede it, so the output respects every rule. If the rules contain a cycle, the letters on it never reach indegree `0`; the output comes up short of the letter set, and the answer is `""`.

Store each edge once (a set per letter). Incrementing an indegree for a repeated rule but keeping only one copy of the edge leaves a letter forever waiting.

## Complexity

`O(C)` time, where `C` is the total number of characters: the pair scan touches each character at most twice, and the graph has at most 26 nodes and one edge per adjacent pair. Extra space is `O(1)` for a fixed alphabet — at most 26 nodes and `26 · 25` distinct edges — or `O(U + E)` for `U` distinct letters and `E` rules in general.

## Pitfalls

- The prefix case (`["ab", "a"]`) gives no edge, so it slips past a graph-only solution.
- Adding an edge for *every* differing position instead of only the first invents rules — `["abc", "bca"]` would claim `b < c` and `c < a`.
- Leaving out letters that never appear in a rule.
- Counting a repeated rule twice in the indegree but once in the edge set.
