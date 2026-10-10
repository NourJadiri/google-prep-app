class Solution:
    def pathSum(self, root: Optional[TreeNode], targetSum: int) -> List[List[int]]:
        paths, path = [], []

        def dfs(node, remaining):
            path.append(node.val)                   # choose
            remaining -= node.val
            if node.left is None and node.right is None:
                if remaining == 0:                  # only a leaf can end a path
                    paths.append(path[:])           # a copy: `path` keeps changing
            else:
                # No early exit when `remaining` drops below zero: values can
                # be negative, so a later node can bring the sum back.
                if node.left:
                    dfs(node.left, remaining)       # explore
                if node.right:
                    dfs(node.right, remaining)
            path.pop()                              # un-choose

        if root:
            dfs(root, targetSum)
        return paths
