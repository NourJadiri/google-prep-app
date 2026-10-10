# Overwrites root.left before reading it, so the original left subtree is lost
# and the inverted right subtree ends up hanging on both sides.
class Solution:
    def invertTree(self, root):
        if root is None:
            return None
        root.left = self.invertTree(root.right)
        root.right = self.invertTree(root.left)
        return root
