# Assumes the longest path passes through the root: adds the heights of the
# root's two subtrees and never looks for a better bend lower down.
class Solution:
    def diameterOfBinaryTree(self, root):
        def height(node):
            if node is None:
                return 0
            return 1 + max(height(node.left), height(node.right))

        return height(root.left) + height(root.right)
