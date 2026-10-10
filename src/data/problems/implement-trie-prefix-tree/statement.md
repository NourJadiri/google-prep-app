# Implement Trie (Prefix Tree)

## The task

Build the index behind an autocomplete box: a trie (prefix tree) over lowercase words. Implement `class Trie`:

- `Trie()` — starts empty
- `insert(word)` — stores `word`; inserting a word that is already stored changes nothing
- `search(word)` — `True` if `word` itself was inserted, `False` otherwise
- `startsWith(prefix)` — `True` if at least one inserted word begins with `prefix`, `False` otherwise

Every word is a prefix of itself, so `startsWith` is `True` for any inserted word. A query is never inserted by asking about it.

The tests drive the class LeetCode-style: a list of operation names and a matching list of argument lists, with the constructor first. The expected output holds one entry per operation — `null` for the constructor and for `insert`.

## Examples

**Example 1**

```
ops  = ["Trie","insert","search","search","startsWith","insert","search"]
args = [[],["carpet"],["carpet"],["car"],["car"],["car"],["car"]]
                                                    -> [null,null,true,false,true,null,true]
```

While only `carpet` is stored, `car` is a prefix (`startsWith` says `True`) but not a word (`search` says `False`). Once `car` is inserted too, `search("car")` turns `True`.

**Example 2**

```
ops  = ["Trie","insert","startsWith","search","startsWith"]
args = [[],["moon"],["moon"],["moons"],["mon"]]
                                    -> [null,null,true,false,false]
```

A word is a prefix of itself. `moons` runs past the end of every stored word, and `mon` parts ways with `moon` at the third letter.

**Example 3**

```
ops  = ["Trie","search","startsWith","insert","search"]
args = [[],["a"],["a"],["a"],["a"]]
                                -> [null,false,false,null,true]
```

An empty trie answers `False` to everything.

## Constraints

- `1 <= word.length, prefix.length <= 300`
- `word` and `prefix` consist of lowercase English letters only.
- At most `3 * 10^4` calls in total to `insert`, `search` and `startsWith`.

## Aim for

`O(L)` per call for a string of length `L`, no matter how many words are stored. One node per distinct prefix: a map from letter to child, plus a flag meaning *a word ends exactly here*. `insert` walks the path creating what's missing and sets the flag; `search` and `startsWith` walk it read-only and differ only in whether they demand the flag at the end. Space is `O(total letters inserted)` in the worst case, less when words share prefixes.

## Follow-ups

- Add `countWordsStartingWith(prefix)` in `O(L)`. What extra number does each node carry, and when is it updated?
- Support `erase(word)`, and prune any branch that no longer leads to a word.
- Children as a 26-slot array versus a hash map: what does each cost in time and memory, and when would you pick the array?
