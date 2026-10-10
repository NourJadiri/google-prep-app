# Bellman-Ford: relax every link n - 1 times. A shortest route uses at most
# n - 1 links, so after that every arrival time is final.
class Solution:
    def networkDelayTime(self, times, n, k):
        INF = float("inf")
        dist = [INF] * (n + 1)
        dist[k] = 0
        for _ in range(n - 1):
            for u, v, w in times:
                if dist[u] + w < dist[v]:
                    dist[v] = dist[u] + w
        worst = max(dist[1:])
        return -1 if worst == INF else worst
