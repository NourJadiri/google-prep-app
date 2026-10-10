class Solution:
    def invertTree(self, root: Optional[TreeNode]) -> Optional[TreeNode]:
        if root is None:        # the mirror image of an empty tree is empty
            return None
        # Mirror both subtrees and hang them on the opposite sides. The right
        # side is evaluated in full before either link changes, so both calls
        # see the original children.
        root.left, root.right = self.invertTree(root.right), self.invertTree(root.left)
        return root
