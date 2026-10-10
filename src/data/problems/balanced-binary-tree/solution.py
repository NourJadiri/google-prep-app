class Solution:
    def isBalanced(self, root: Optional[TreeNode]) -> bool:
        def height(node):
            # The height of node's subtree, or -1 if it is unbalanced anywhere
            # inside. -1 can never be a real height, so it's safe as a signal.
            if node is None:
                return 0
            left = height(node.left)
            if left == -1:
                return -1           # already lost below: no need to look right
            right = height(node.right)
            if right == -1 or abs(left - right) > 1:
                return -1
            return 1 + max(left, right)

        return height(root) != -1
