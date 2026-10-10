class Solution:
    def isSubtree(self, root: Optional[TreeNode], subRoot: Optional[TreeNode]) -> bool:
        if root is None:                # an empty tree holds no copy of anything
            return False
        # The copy either starts right here, or it's somewhere inside one of
        # the two subtrees. `or` stops at the first place that works.
        return (self.isSameTree(root, subRoot)
                or self.isSubtree(root.left, subRoot)
                or self.isSubtree(root.right, subRoot))

    def isSameTree(self, a: Optional[TreeNode], b: Optional[TreeNode]) -> bool:
        # Same Tree, unchanged: both trees must run out at exactly the same
        # places, so a match can't have extra nodes hanging below.
        if a is None and b is None:
            return True
        if a is None or b is None:
            return False
        return a.val == b.val and self.isSameTree(a.left, b.left) and self.isSameTree(a.right, b.right)
