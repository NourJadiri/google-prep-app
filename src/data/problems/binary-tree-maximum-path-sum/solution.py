class Solution:
    def maxPathSum(self, root: Optional[TreeNode]) -> int:
        best = -math.inf

        def gain(node):
            # The best sum of a path that starts at `node` and only goes down.
            nonlocal best
            if node is None:
                return 0
            left = max(gain(node.left), 0)      # a branch that loses money is left out
            right = max(gain(node.right), 0)
            best = max(best, node.val + left + right)   # the path that bends here
            return node.val + max(left, right)          # going up, only one branch can come along

        gain(root)
        return best
