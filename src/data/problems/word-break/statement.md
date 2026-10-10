# Word Break

## The task

You're given a string `s` and a list of distinct words `wordDict`. Decide whether `s` can be cut into a sequence of one or more pieces, each of which is a word in `wordDict`. Return `True` if it can and `False` if it can't.

A word may be used as many times as you like, and words you don't need can be ignored. The pieces have to cover all of `s`, in order: no character left over, none skipped, none shared by two pieces.

## Examples

**Example 1**

```
s = "carpetsale", wordDict = ["car","carpet","pets","ale"]   -> true
```

`"car" + "pets" + "ale"`. Grabbing the longest word first, `"carpet"`, leaves `"sale"` — and no word starts with `s`.

**Example 2**

```
s = "seashells", wordDict = ["sea","shell","sells"]   -> false
```

`"sea" + "shell"` gets within one letter, but the final `"s"` isn't a word.

**Example 3**

```
s = "tictactic", wordDict = ["tic","tac"]   -> true
```

`"tic" + "tac" + "tic"`: the same word can appear more than once.

## Constraints

- `1 <= s.length <= 300`
- `1 <= wordDict.length <= 1000`
- `1 <= wordDict[i].length <= 20`
- `s` and every word consist of lowercase English letters.
- The words in `wordDict` are distinct.

## Aim for

Backtracking over split points is correct but exponential: on `"aaa…ab"` with words `"a"`, `"aa"`, `"aaa"` it tries every way to carve up the a's before failing at the `b`. All a later choice needs to know is *where* the last cut was — so make the position the state. Let `dp[i]` say whether the first `i` characters split cleanly: `dp[0]` is true, and `dp[i]` is true when some word `w` ends exactly at `i` and `dp[i - len(w)]` is true. Keep the words in a set and try only the word lengths that occur: `O(n · L)` substring checks for `n = len(s)` and `L` = the longest word, `O(n)` extra space.

## Follow-ups

- Return every way to split `s` (Word Break II). Why can't any algorithm be polynomial on that version?
- Return the fewest words a split can use, or `-1` when there's no split.
- With a million dictionary words, how does a trie, walked forward from each reachable index, change the inner loop?
