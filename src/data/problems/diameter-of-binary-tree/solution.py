class Solution:
    def diameterOfBinaryTree(self, root: Optional[TreeNode]) -> int:
        best = 0

        def height(node):
            # Returns the height of node's subtree (nodes on its longest
            # downward path) and, on the side, records the longest path that
            # bends at node.
            nonlocal best
            if node is None:
                return 0
            left = height(node.left)
            right = height(node.right)
            best = max(best, left + right)  # edges: left going down, right going down
            return 1 + max(left, right)     # what the parent can extend upward

        height(root)
        return best
