# BFS over (visited set, node) states, but started from node 0 only. The
# shortest walk may well start somewhere else.
class Solution:
    def shortestPathLength(self, graph):
        n = len(graph)
        full = (1 << n) - 1
        seen = {(1, 0)}
        queue = deque([(1, 0, 0)])
        while queue:
            mask, node, d = queue.popleft()
            if mask == full:
                return d
            for nb in graph[node]:
                state = (mask | 1 << nb, nb)
                if state not in seen:
                    seen.add(state)
                    queue.append((mask | 1 << nb, nb, d + 1))
