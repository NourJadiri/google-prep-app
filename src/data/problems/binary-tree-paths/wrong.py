# Ends a path at every missing child instead of only at leaves: each leaf's
# path is recorded twice, and a node with one child yields a path that stops
# halfway down.
class Solution:
    def binaryTreePaths(self, root):
        paths = []

        def dfs(node, trail):
            if node is None:
                paths.append(trail)
                return
            trail = trail + "->" + str(node.val) if trail else str(node.val)
            dfs(node.left, trail)
            dfs(node.right, trail)

        dfs(root, "")
        return paths
