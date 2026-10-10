class Solution:
    def maxDepth(self, root: Optional[TreeNode]) -> int:
        if root is None:        # an empty tree has no nodes, so no path at all
            return 0
        # The longest path down from here is this node plus the longest path
        # in whichever subtree goes deeper.
        return 1 + max(self.maxDepth(root.left), self.maxDepth(root.right))
