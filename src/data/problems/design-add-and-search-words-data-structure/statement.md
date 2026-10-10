# Design Add and Search Words Data Structure

## The task

Build the word store behind a crossword helper. It collects words, then answers queries in which `.` stands for any one letter. Implement `class WordDictionary`:

- `WordDictionary()` — starts empty
- `addWord(word)` — stores `word`
- `search(word)` — `True` if at least one stored word matches `word`, `False` otherwise

A stored word matches a query when both have the same length and, at every position, the query has either the same letter or a `.`. A `.` stands for exactly one letter — never zero letters, never two.

The tests drive the class LeetCode-style: a list of operation names and a matching list of argument lists, with the constructor first. The expected output holds one entry per operation — `null` for the constructor and for `addWord`.

## Examples

**Example 1**

```
ops  = ["WordDictionary","addWord","addWord","search","search","search","search"]
args = [[],["bat"],["cad"],[".ad"],["b.."],["ba"],["..t"]]
                                              -> [null,null,null,true,true,false,true]
```

`.ad` can only be `cad`, even though `bat` was stored first. `b..` matches `bat`. `ba` matches nothing, because no stored word has two letters.

**Example 2**

```
ops  = ["WordDictionary","addWord","search","search","search"]
args = [[],["bake"],["ba."],["ba.e"],["bake."]]
                                     -> [null,null,false,true,false]
```

`ba.` asks for a three-letter word and `bake.` for a five-letter one; only `ba.e` has the right length.

**Example 3**

```
ops  = ["WordDictionary","search","addWord","search"]
args = [[],["."],["z"],["."]]
                            -> [null,false,null,true]
```

An empty store matches nothing. Once `z` is stored, `.` matches it.

## Constraints

- `1 <= word.length <= 25`
- In `addWord`, `word` consists of lowercase English letters.
- In `search`, `word` consists of lowercase English letters and `.`, with at most 2 dots.
- At most `10^4` calls in total to `addWord` and `search`.

## Aim for

Implement Trie with one twist. `addWord` is plain trie insertion, `O(L)`. `search` walks the trie depth-first: a letter follows its one child, a `.` tries every child and returns at the first success. That's `O(L)` for a query without dots and at most `O(26^2 * L)` with two — bounded by the query, never by how many words are stored. Scanning every stored word is `O(N * L)` per query; say it, then beat it.

## Follow-ups

- Drop the two-dot limit. What is the worst case now, and which queries hit it?
- Add `*` for "any run of letters, possibly empty". How does the search change, and what can blow up?
- Most real queries start with dots (`..ing`). What would you store so those stay cheap?
