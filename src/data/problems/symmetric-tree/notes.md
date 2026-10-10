## Approach

The root can't break symmetry by itself — it sits on the fold line. What matters is whether the root's left subtree is the mirror image of its right subtree. That's a question about two trees at once, so write a helper, `mirrored(a, b)`, that answers it for any two trees, and call it on `root.left` and `root.right`.

The helper is Same Tree with one change. Same Tree paired left with left and right with right. Mirror images pair across: picture the two trees facing each other over the fold line.

- The **outer** pair: `a.left` faces `b.right`.
- The **inner** pair: `a.right` faces `b.left`.

So the rules, empty cases first, exactly as in Same Tree:

- Both empty: a gap facing a gap — mirrored, return `True`.
- Exactly one empty: a node facing a gap — return `False`.
- Both real nodes: mirrored exactly when `a.val == b.val`, the outer pair is mirrored, and the inner pair is mirrored.

The last two checks are the same question on smaller trees, so hand them to the recursion and trust the answers.

Trace Example 2, `[5,1,1,2,null,2]`. The helper starts with the two `1`s: the values match, so it checks the outer pair — the left `1`'s left child (`2`) against the right `1`'s right child (empty). A node facing a gap: `False`, and the `and` chain stops there.

Why it's correct: every node on the left side gets compared with the node in its mirror position on the right side, and a node whose mirror position is empty is caught by the "exactly one empty" rule. `True` comes back only if the whole left side folds exactly onto the right.

Iteratively, the same rules drive a queue of pairs: start with `(root.left, root.right)`; take out a pair, apply the three rules, and add `(a.left, b.right)` and `(a.right, b.left)`.

What about checking that each level reads the same backwards? That's correct only if you keep a placeholder for every missing child. Drop the gaps and Example 2 sneaks through: its rows read `1, 1` and `2, 2`, both palindromes.

The pattern: when a question compares two parts of trees — identical? mirror images? — write a helper that walks both in lockstep, handles the empty cases first, and pairs up the children. Between problems, only the pairing changes.

## Complexity

`O(n)` time: each node is compared once, against its mirror partner, and the walk stops at the first mismatch. `O(h)` extra space for the call stack, where `h` is the height.

## Pitfalls

- Pairing left with left and right with right. That checks the two sides are copies of each other, not mirror images — `[3,4,4,5,6,5,6]` has identical sides and isn't symmetric.
- Checking each level for palindromes while skipping the missing children (above).
- Comparing only the root's two children. Symmetry has to hold all the way down.
