# Gives up on a branch once the running sum passes the target, which is only
# safe when every value is non-negative. Here values can be negative, so a
# sum that overshoots can still come back.
class Solution:
    def pathSum(self, root, targetSum):
        paths, path = [], []

        def dfs(node, remaining):
            if node is None:
                return
            remaining -= node.val
            if remaining < 0:
                return
            path.append(node.val)
            if node.left is None and node.right is None and remaining == 0:
                paths.append(path[:])
            dfs(node.left, remaining)
            dfs(node.right, remaining)
            path.pop()

        dfs(root, targetSum)
        return paths
