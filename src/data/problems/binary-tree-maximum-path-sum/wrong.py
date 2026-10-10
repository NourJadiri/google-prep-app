# Hands the bent path up to the parent: node + left + right goes back up as if
# a path could fork, so a parent adds both of a child's branches at once.
class Solution:
    def maxPathSum(self, root):
        best = float("-inf")

        def gain(node):
            nonlocal best
            if node is None:
                return 0
            left = max(gain(node.left), 0)
            right = max(gain(node.right), 0)
            best = max(best, node.val + left + right)
            return node.val + left + right

        gain(root)
        return best
