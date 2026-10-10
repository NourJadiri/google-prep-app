class Solution:
    def rob(self, root: Optional[TreeNode]) -> int:
        def best(node):
            # (best total in this subtree if node is robbed, best if it isn't)
            if node is None:
                return 0, 0
            left_take, left_skip = best(node.left)
            right_take, right_skip = best(node.right)
            take = node.val + left_skip + right_skip                    # children must be left alone
            skip = max(left_take, left_skip) + max(right_take, right_skip)  # each child chooses freely
            return take, skip

        return max(best(root))
