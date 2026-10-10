## Approach

The values are easy to write down; the shape is the hard part. So write the shape down explicitly: list the nodes in preorder (node, then left subtree, then right subtree), write a marker `#` for every missing child, and join the tokens with commas.

- `serialize`: a DFS that writes the node's value, then its left subtree, then its right subtree, and writes `#` for each `None`.
- `deserialize`: split the string into tokens and read them through one shared iterator. `read()` takes the next token. `#` means an empty subtree. Anything else becomes a node, followed by `read()` for its left subtree and then `read()` for its right subtree, in the same order that `serialize` wrote them.

Why reading back is unambiguous: the tokens of any subtree form one unbroken block. The block starts with the subtree's root, then comes the block of its left subtree, then the block of its right subtree, and a lone `#` is a complete block by itself. `read()` consumes exactly one such block. So every recursive call takes exactly the tokens its own subtree wrote, and the tree comes back node for node.

Why the markers are needed: without them, the preorder `1,2` could be `[1,2]` or `[1,null,2]`. With them, every node has exactly two child slots in the string, so there's nothing left to guess. In-order fails even with markers: `[1,2]` and `[2,null,1]` both come out as `#,2,#,1,#`, because in-order doesn't record which node is the root.

Level order with `null`s, the notation these tests use, is the other standard answer. Write the nodes breadth-first. To read them back, the first value is the root, and the following values are handed out two at a time, left child then right child, to the nodes in queue order.

## Complexity

`O(n)` time in each direction. The string holds `n` values and `n + 1` markers, so its length is `O(n)`. The preorder version recurses `O(h)` deep; the level-order version uses a queue of `O(width)` instead.

## Pitfalls

- Dropping the null markers. Values alone don't fix the shape.
- Reading characters instead of tokens. `-3` and `25` are longer than one character, so use a separator and `split`.
- The empty tree. `serialize(None)` must still return a string, and `deserialize` must turn it back into `None`.
- Passing anything around except the string: state kept on the object, or the old nodes handed back. The two calls run on different `Codec` objects, and only the string may carry the tree.
