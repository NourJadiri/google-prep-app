## Approach

Store the words in a trie, exactly as in Implement Trie: every node has `children` (letter → node) and an `is_word` flag, and `addWord` is ordinary insertion.

`search` is a depth-first search over pairs (trie node, position in the query). `match(node, i)` answers one question: can some path below `node` spell `word[i:]` and stop exactly on a stored word?

- When the query runs out (`i == len(word)`), the answer is `node.is_word`. The walk has to end on a whole word, not just somewhere along a path.
- A letter has one way forward: the child for that letter, if there is one.
- A dot can be any letter, so try each child in turn. Return `True` as soon as one works, and `False` only after all of them have failed.

This is backtracking, with the trie keeping it small. Each step of `match` follows the definition of "matches" one position at a time. The trie has a path for exactly the prefixes of the stored words, so trying every child at a dot covers every stored word that could fill that position. Checking `is_word` at the end makes the lengths equal.

The same search can be written without recursion. Keep a *frontier*: the trie nodes reachable by the first `i` characters of the query. A letter replaces each node with its child, a dot replaces it with all of its children, and at the end the answer is whether any frontier node has `is_word`. It's the same work, done level by level, but it can't stop at the first match the way depth-first search can.

## Complexity

`addWord` is `O(L)`. A query without dots is `O(L)`. With `d` dots the search splits into at most `26^d` branches, so it's `O(26^d * L)`. Two dots at most keeps that to a constant times `L`, however many words are stored. Space is `O(total letters added)`.

For comparison, scanning a list of words costs `O(N * L)` per query and grows with the store; the large test is sized so that this falls well over the time limit.

## Pitfalls

- Returning from inside the loop over children: `for child in ...: return match(child, i + 1)` only ever tries the first child, so `.ad` misses `cad` whenever `bat` was stored first. Return `True` on a success; fall through to `False` after the loop.
- Accepting any node at the end of the query: `ba.` must not match `bake`. When the query runs out, check `is_word`.
- Letting a dot match zero letters, or more than one. The lengths must be equal.
