class Solution:
    def averageOfLevels(self, root):
        # File every value under its depth (any traversal order will do),
        # then average each depth's values.
        by_depth = {}
        stack = [(root, 0)]
        while stack:
            node, depth = stack.pop()
            by_depth.setdefault(depth, []).append(node.val)
            for child in (node.left, node.right):
                if child:
                    stack.append((child, depth + 1))
        return [sum(by_depth[d]) / len(by_depth[d]) for d in range(len(by_depth))]
