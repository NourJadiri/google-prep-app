class Solution:
    def isValidBST(self, root: Optional[TreeNode]) -> bool:
        def within(node, low, high):
            # Every value in this subtree must lie strictly between low and high:
            # the bounds collect the constraints of every ancestor, not just the parent.
            if node is None:
                return True
            if not low < node.val < high:
                return False
            return within(node.left, low, node.val) and within(node.right, node.val, high)

        # Infinite bounds, so values at the integer limits need no special case.
        return within(root, -math.inf, math.inf)
