class Solution:
    def binaryTreePaths(self, root: Optional[TreeNode]) -> List[str]:
        paths, path = [], []

        def dfs(node):
            path.append(str(node.val))              # choose this node
            if node.left is None and node.right is None:
                paths.append("->".join(path))       # a leaf ends one path
            else:
                if node.left:
                    dfs(node.left)                  # explore each child that exists
                if node.right:
                    dfs(node.right)
            path.pop()                              # un-choose on the way back up

        dfs(root)
        return paths
