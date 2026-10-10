class Solution:
    def rob(self, root):
        # Either rob this house and jump to the grandchildren, or skip it and
        # ask the children. Memoised on the node, or a chain blows up.
        memo = {}

        def rob(node):
            if node is None:
                return 0
            if node in memo:
                return memo[node]
            take = node.val
            for child in (node.left, node.right):
                if child is not None:
                    take += rob(child.left) + rob(child.right)
            skip = rob(node.left) + rob(node.right)
            memo[node] = max(take, skip)
            return memo[node]

        return rob(root)
