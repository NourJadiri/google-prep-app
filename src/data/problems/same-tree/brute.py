class Solution:
    def isSameTree(self, p, q):
        # Two trees are the same exactly when they hold the same values at the
        # same places. Name each node by its path from the root (one L or R per
        # step down) and compare the two {path: value} maps.
        def places(root):
            found, stack = {}, [(root, "")]
            while stack:
                node, path = stack.pop()
                if node is not None:
                    found[path] = node.val
                    stack.append((node.left, path + "L"))
                    stack.append((node.right, path + "R"))
            return found

        return places(p) == places(q)
