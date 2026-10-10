from collections import deque


class Solution:
    def diameterOfBinaryTree(self, root):
        # Treat the tree as an undirected graph and measure the distance
        # between every pair of nodes with a breadth-first search from each one.
        neighbours = {}
        stack = [root]
        while stack:
            node = stack.pop()
            neighbours.setdefault(id(node), [])
            for child in (node.left, node.right):
                if child is not None:
                    neighbours[id(node)].append(id(child))
                    neighbours.setdefault(id(child), []).append(id(node))
                    stack.append(child)
        best = 0
        for start in neighbours:
            dist = {start: 0}
            queue = deque([start])
            while queue:
                u = queue.popleft()
                for v in neighbours[u]:
                    if v not in dist:
                        dist[v] = dist[u] + 1
                        queue.append(v)
            best = max(best, max(dist.values()))
        return best
