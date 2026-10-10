## Approach

This is tree DP. The contract per node: return a pair `(take, skip)`, the best total in this subtree if this node is robbed and the best total if it isn't.

- `take = node.val + left.skip + right.skip`. Robbing this house rules out both children, but everything below them is free again, which is exactly what their `skip` totals describe.
- `skip = max(left) + max(right)`. With this house untouched, each child makes its own best choice, robbed or not.

An empty subtree returns `(0, 0)`, and the answer is `max(take, skip)` at the root. One post-order pass fills every pair.

Why it's correct: the only rule links a node to its children. Once you fix whether a node is robbed, its two subtrees no longer affect each other, so each one can be optimised on its own. The best total for the subtree in each state is built from the children's best totals in the states that are allowed. Those are exactly the numbers the pair carries up.

Two tempting shortcuts fail.

- **Whole levels.** Summing each level and robbing alternate levels, or even running the street version of House Robber over the level sums, assumes the best set takes entire levels. In `[2,1,3,null,4]` the answer takes `3` and `4`, which share no level.
- **The grandchildren recursion without a memo.** `rob(node) = max(node.val + rob(grandchildren), rob(children))` is correct, but it recomputes the same subtrees again and again. On a chain, the calls grow like the Fibonacci numbers. Memoising on the node (a dictionary keyed by node) makes it linear. Returning the pair gets the same result with no dictionary at all.

## Complexity

`O(n)` time, since every node is visited once, with `O(h)` recursion stack. The unmemoised grandchildren recursion is exponential: on a chain, `T(k) = T(k-1) + T(k-2)`.

## Pitfalls

- Choosing whole levels. The best set can skip two levels in a row, and it can choose differently in different branches.
- Recursing on grandchildren without memoisation. It's correct, but hopeless on a 1,000-node chain.
- Making `skip` add up the children's `take` totals. Leaving a node alone doesn't force you to rob its children; each child takes the better of its own two totals.
