class Solution:
    def isSameTree(self, p: Optional[TreeNode], q: Optional[TreeNode]) -> bool:
        if p is None and q is None:     # two empty trees are identical
            return True
        if p is None or q is None:      # a node facing an empty spot
            return False
        # Both are real nodes: the values must match, then both pairs of
        # subtrees. `and` stops at the first difference it finds.
        return (p.val == q.val
                and self.isSameTree(p.left, q.left)
                and self.isSameTree(p.right, q.right))
