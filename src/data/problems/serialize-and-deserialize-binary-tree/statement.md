# Serialize and Deserialize Binary Tree

## The task

Design a way to turn a binary tree into a string and back again. Implement `class Codec`:

- `serialize(root)` — returns a `str` that encodes the whole tree under `root` (`root` may be `None`)
- `deserialize(data)` — takes a string made by `serialize`, rebuilds the tree from it, and returns the new root (or `None`)

The format is entirely up to you. The only requirement is the round trip: `deserialize(serialize(root))` must give back a tree with exactly the same shape and the same value at every position. Values may repeat. The two calls are made on two different `Codec` objects, so the string is the only thing passed from one to the other, and `deserialize` must build new nodes rather than return the old ones.

How the tests are written: trees use LeetCode's level order, listing the values level by level, left to right, with `null` for a missing child. Each test is an `ops` / `args` pair in which `ops` is always `["Codec"]` and `args` is `[[tree]]`, one list holding the tree. The judge builds that tree, calls `serialize` on one `Codec` and `deserialize` on a fresh one, and compares the rebuilt tree, written in level order, with the expected output: the original tree itself.

## Examples

**Example 1**

```
ops  = ["Codec"]
args = [[[10,25,-3,null,7,18]]]
                    -> [10,25,-3,null,7,18]
```

Whatever string you produce, reading it back must give this exact tree: `10` at the root, `25` on its left with a right child `7`, and `-3` on its right with a left child `18`.

**Example 2**

```
ops  = ["Codec"]
args = [[[1,null,2]]]
              -> [1,null,2]
```

The tree `[1,2]` holds the same values with `2` on the other side. Your string has to tell the two apart, so listing the values alone isn't enough.

**Example 3**

```
ops  = ["Codec"]
args = [[[]]]
       -> []
```

The empty tree: `serialize(None)` still returns a string, and `deserialize` turns that string back into `None`.

## Constraints

- `0 <= number of nodes <= 10^4`
- `-1000 <= Node.val <= 1000`
- The tree is at most `1000` levels deep.

## Aim for

`O(n)` time in each direction and an `O(n)` string. Preorder with an explicit marker for every missing child pins down the shape: read the tokens back in the same order, and each recursive call consumes exactly one subtree. Separate the tokens, so that `-12` stays one value. Level order with null markers works just as well; it's the notation these tests use.

## Follow-ups

- Make the string compact. What do the null markers cost, and can another encoding avoid most of them?
- The tree is a binary search tree. Why can the markers be dropped entirely?
- The tree is too big to hold in memory as one string. Serialize and rebuild it as a stream of tokens.
