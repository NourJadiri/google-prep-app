class Solution:
    def pathSum(self, root, targetSum):
        # List every root-to-leaf path with an explicit stack, then filter.
        if root is None:
            return []
        out, stack = [], [(root, (root.val,))]
        while stack:
            node, vals = stack.pop()
            kids = [c for c in (node.left, node.right) if c is not None]
            if not kids and sum(vals) == targetSum:
                out.append(list(vals))
            for c in kids:
                stack.append((c, vals + (c.val,)))
        return out
