# Word Ladder

## The task

You're given two words of the same length, `beginWord` and `endWord`, and a dictionary `wordList`. A ladder is a sequence of words that starts with `beginWord` and ends with `endWord`, where each word differs from the one before it in exactly one position. Every word after `beginWord` must be in `wordList`; `beginWord` itself doesn't have to be.

Return the number of words in the shortest ladder, or `0` if there is no ladder.

## Examples

**Example 1**

```
beginWord = "lead", endWord = "gold", wordList = ["load","lord","goad","gold","good","lewd","goal"]   -> 4
```

`lead → load → goad → gold`: four words, with one letter changing at each step.

**Example 2**

```
beginWord = "cold", endWord = "warm", wordList = ["cord","card","ward","worm","word"]   -> 0
```

`cold → cord → card → ward` gets within one letter, but `warm` isn't in the list, so no ladder can end there.

**Example 3**

```
beginWord = "a", endWord = "c", wordList = ["b","c"]   -> 2
```

Any two different one-letter words differ in exactly one position, so `a → c` is a ladder of two words.

## Constraints

- `1 <= beginWord.length <= 10`
- `endWord.length == beginWord.length`
- `1 <= wordList.length <= 5000`
- `wordList[i].length == beginWord.length`
- All words consist of lowercase English letters.
- `beginWord != endWord`
- The words in `wordList` are distinct.

## Aim for

Words are nodes, and "one letter apart" is an edge, so the shortest ladder is a BFS from `beginWord`, one layer per rung. The trap is building the edges: comparing every pair of words costs `O(N^2·L)`. Instead, find each word's neighbours directly. Either try all 26 letters in each position and look the result up in a set, or bucket the dictionary by wildcard patterns (`c*ld`) so a word's neighbours are a few lookups away. That's `O(N·L^2)` with buckets. Bidirectional BFS is the upgrade.

## Follow-ups

- Return every shortest ladder, not just the length.
- Search from both ends at once. How much does that save, and how do you detect that the two searches have met?
- The words get very long but the dictionary stays small. Which way of finding neighbours wins now?
