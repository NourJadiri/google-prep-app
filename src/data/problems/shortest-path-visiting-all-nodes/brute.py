# The best walk visits nodes for the first time in some order, going between
# consecutive ones by a shortest path. So: all-pairs distances by BFS, then
# the cheapest order over subsets (best[mask][v] = cheapest way to have first
# visited exactly `mask`, ending at v).
class Solution:
    def shortestPathLength(self, graph):
        n = len(graph)
        dist = []
        for s in range(n):
            d = [None] * n
            d[s] = 0
            queue = [s]
            for u in queue:
                for v in graph[u]:
                    if d[v] is None:
                        d[v] = d[u] + 1
                        queue.append(v)
            dist.append(d)
        INF = float("inf")
        best = [[INF] * n for _ in range(1 << n)]
        for v in range(n):
            best[1 << v][v] = 0
        for mask in range(1 << n):
            for v in range(n):
                if best[mask][v] == INF:
                    continue
                for u in range(n):
                    if not mask >> u & 1:
                        m = mask | 1 << u
                        best[m][u] = min(best[m][u], best[mask][v] + dist[v][u])
        return min(best[(1 << n) - 1])
