## Approach

The contract per node: *tell me what your subtree contains.* A call on `root` returns

- `None` if neither `p` nor `q` is in this subtree,
- `p` or `q` if exactly one of them is here,
- their lowest common ancestor if both are.

The base cases: an empty subtree returns `None`, and a node that *is* `p` or `q` returns itself right away, without looking further down. Stopping there is safe. If the other node is somewhere below, this node is the answer, and returning it is right. If the other node is elsewhere, this node is the one thing this subtree has to report.

Otherwise, ask both children. If both report something, `p` and `q` are on different sides, and this node is where their paths split, so return it. If only one side reports something, pass that up unchanged. It's either the answer already found deeper down, or the single target found so far.

Why it's correct: let `x` be the true answer. At `x`, the function returns `x`, either because `x` is one of the two nodes or because each side reports one of them. Every node above `x` has all of `x`'s subtree on one side and nothing relevant on the other, so `x` is passed up unchanged all the way to the root.

The alternative is to store every node's parent with one traversal, collect `p` and all its ancestors in a set, and climb from `q` until you reach a node in that set.

## Complexity

The one-pass solution is `O(n)` time, since every node is visited at most once, with `O(h)` recursion stack. The parent map is also `O(n)` time, but it needs `O(n)` extra memory for the map and the set.

## Pitfalls

- Forgetting that a node is its own ancestor. When `p` is above `q`, the answer is `p`, not `p`'s parent.
- Walking the tree as if it were a BST, going left or right by comparing values. It isn't one: in `[50,10,90,95,5,85,15]`, `95` and `5` are both children of `10`.
- Returning a value or a fresh node. The answer has to be one of the tree's own nodes.
- Comparing nodes by value. It happens to work here only because the values are distinct; compare nodes with `is`.
