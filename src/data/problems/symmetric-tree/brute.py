class Solution:
    def isSymmetric(self, root):
        # Name each node by its path from the root (one L or R per step down).
        # Mirroring swaps every L and R in every path, so the tree is
        # symmetric exactly when that swap maps the {path: value} map onto
        # itself.
        places, stack = {}, [(root, "")]
        while stack:
            node, path = stack.pop()
            if node is not None:
                places[path] = node.val
                stack.append((node.left, path + "L"))
                stack.append((node.right, path + "R"))
        swap = str.maketrans("LR", "RL")
        for path, val in places.items():
            twin = path.translate(swap)
            if twin not in places or places[twin] != val:
                return False
        return True
