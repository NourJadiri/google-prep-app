class Solution:
    def invertTree(self, root):
        # Name every node by its path from the root ("" for the root, then one
        # L or R per step down). The mirror image keeps every value but swaps
        # L and R in every path, so build a fresh tree from the swapped paths.
        if root is None:
            return None
        paths = {}
        stack = [(root, "")]
        while stack:
            node, path = stack.pop()
            paths[path] = node.val
            if node.left:
                stack.append((node.left, path + "L"))
            if node.right:
                stack.append((node.right, path + "R"))
        swap = str.maketrans("LR", "RL")
        built = {}
        for path in sorted(paths, key=len):  # parents before their children
            new_path = path.translate(swap)
            node = TreeNode(paths[path])
            built[new_path] = node
            if new_path:
                parent = built[new_path[:-1]]
                if new_path[-1] == "L":
                    parent.left = node
                else:
                    parent.right = node
        return built[""]
