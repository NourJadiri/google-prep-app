# Only checks the root: its two subtrees have similar heights, but a lopsided
# node further down goes unnoticed.
class Solution:
    def isBalanced(self, root):
        def height(node):
            if node is None:
                return 0
            return 1 + max(height(node.left), height(node.right))

        if root is None:
            return True
        return abs(height(root.left) - height(root.right)) <= 1
