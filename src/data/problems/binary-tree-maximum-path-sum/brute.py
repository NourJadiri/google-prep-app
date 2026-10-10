class Solution:
    def maxPathSum(self, root):
        # A path is fixed by its two end nodes. Treat the tree as an undirected
        # graph and walk from every node to every other node, adding up values.
        neighbours = {}
        stack = [root]
        while stack:
            node = stack.pop()
            neighbours.setdefault(node, [])
            for child in (node.left, node.right):
                if child is not None:
                    neighbours[node].append(child)
                    neighbours[child] = [node]
                    stack.append(child)

        best = None
        for start in neighbours:
            walk = [(start, None, start.val)]
            while walk:
                node, came_from, total = walk.pop()
                if best is None or total > best:
                    best = total
                for nxt in neighbours[node]:
                    if nxt is not came_from:
                        walk.append((nxt, node, total + nxt.val))
        return best
