## Approach

Every path has exactly one highest node, the place where it bends, or its top end if it only goes down. Picture the path as two downward arms hanging from that node, either of which may be empty. So: for every node `x`, find the best path whose highest node is `x`, then take the maximum over all `x`.

The best path with top `x` is `x.val`, plus the best downward arm into the left subtree if that arm is positive, plus the same for the right subtree. A downward arm starting at a child `c` satisfies its own small recurrence: `gain(c) = c.val + max(0, gain(c.left), gain(c.right))`.

One post-order DFS computes `gain(node)` for every node and, at the same moment, scores the bend at that node, `node.val + max(gain(left), 0) + max(gain(right), 0)`, against a running best. The return value and the running best are deliberately different things. A path may bend once, at its top, but what travels up to the parent has to be a single arm. Hand up the bent shape and the parent would build something that forks, which isn't a path.

Clamping a gain at `0` means "don't take this arm". Start the running best at `-inf` (or at the root's value), not at `0`: when every value is negative, the answer is the largest single value.

Why it's correct: every path is scored exactly once, at its highest node, and there it gets its best possible arms. Every scored candidate really is a path. So the maximum over the candidates is the maximum over all paths.

## Complexity

`O(n)` time, with `O(h)` recursion stack. Recomputing the arms from scratch at every node, by calling a separate downward-gain function from each one, costs `O(n * h)` instead, which is quadratic on a tall tree. One of the large tests is a long handle with a big bush at the bottom, and there that version takes several seconds.

## Pitfalls

- Handing the bent path up to the parent (`node.val + left + right`). The parent then adds a fork. Hand up `node.val + max(left, right)`.
- Starting the best at `0`. An all-negative tree must return its largest value, which is negative.
- Not clamping negative gains. A path can stop anywhere, so a losing branch should add `0`, not drag the sum down.
