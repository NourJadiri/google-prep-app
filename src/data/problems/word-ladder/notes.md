## Approach

Treat each word as a node, with an edge between any two words that differ in exactly one position. A ladder is a path, its length counts the words on it, and every edge costs the same. So the shortest ladder is a BFS from `beginWord`, processed one layer at a time. When `endWord` comes off the queue, the layer number is the answer. If the queue empties first, there's no ladder.

The real work is finding a word's neighbours without comparing it against the whole dictionary. Comparing every pair of words costs `O(N^2·L)`: 12.5 million pairs for 5,000 words, before the BFS even starts. There are two better ways:

- **Try every letter.** For each position, substitute each of the 26 letters and look the result up in a set of dictionary words. That's `26·L` candidates per word, each costing `O(L)` to build.
- **Wildcard buckets** (the reference). Replace each position with `*` in turn: `cold` goes into the buckets `*old`, `c*ld`, `co*d` and `col*`. Two words are neighbours exactly when they share a bucket. Build the buckets once (`L` patterns per word), and a word's neighbours are the contents of its `L` buckets.

The reference also **pops** each bucket the first time it's opened. Every word in the bucket gets queued at that moment, so any later word with the same pattern would find nothing new there. Popping keeps the total work proportional to the number of patterns, even when a bucket is large.

Check `endWord` against the dictionary before searching. It's a legal last rung only if it's in `wordList`. `beginWord` doesn't need to be.

**Bidirectional BFS** is the standard follow-up: search from both ends, always grow the smaller frontier, and stop when the two meet. Each side covers only about half the ladder. The number of words within `k` rungs grows quickly with `k`, so two half-depth searches visit far fewer words than one full-depth search.

## Complexity

With buckets: building them means `O(N·L)` patterns of length `L`, so `O(N·L^2)` time, and the BFS opens each pattern at most once. `O(N·L^2)` space for the buckets. Trying letters instead costs `O(26·N·L^2)` time and `O(N·L)` space for the set.

## Pitfalls

- Returning as soon as you *generate* `endWord`, without checking that it's in `wordList`. Example 2 would come out as 5 instead of 0.
- Counting transformations instead of words. The ladder `a → c` has length 2, not 1.
- Building the graph by comparing all pairs of words. Correct, but quadratic.
- Marking words visited when they're popped instead of when they're queued. The same word can then be queued many times from one layer.
