# Measures edges instead of nodes: a lone root comes out as 0, an empty tree as -1.
class Solution:
    def maxDepth(self, root):
        if root is None:
            return -1
        return 1 + max(self.maxDepth(root.left), self.maxDepth(root.right))
