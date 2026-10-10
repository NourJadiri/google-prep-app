class Solution:
    def shortestPathLength(self, graph: List[List[int]]) -> int:
        n = len(graph)
        full = (1 << n) - 1
        # A state is (bitmask of visited nodes, current node). Any node can be
        # the start, so all n one-node states sit at distance 0 together.
        seen = [[False] * n for _ in range(1 << n)]
        frontier = [(1 << i, i) for i in range(n)]
        for mask, node in frontier:
            seen[mask][node] = True
        steps = 0
        while True:                     # connected, so a full mask is reachable
            nxt = []
            for mask, node in frontier:
                if mask == full:        # BFS layer = number of edges walked
                    return steps
                for nb in graph[node]:
                    m = mask | (1 << nb)
                    if not seen[m][nb]:
                        seen[m][nb] = True
                        nxt.append((m, nb))
            frontier = nxt
            steps += 1
