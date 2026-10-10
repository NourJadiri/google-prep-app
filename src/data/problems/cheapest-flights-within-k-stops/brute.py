# best[v] after round j: the cheapest way to stand in v having taken exactly j
# flights, built only from round j - 1. The answer is the best over 1..k+1.
class Solution:
    def findCheapestPrice(self, n, flights, src, dst, k):
        INF = float("inf")
        best = [INF] * n
        best[src] = 0
        answer = INF
        for _ in range(k + 1):
            nxt = [INF] * n
            for u, v, price in flights:
                if best[u] + price < nxt[v]:
                    nxt[v] = best[u] + price
            best = nxt
            answer = min(answer, best[dst])
        return -1 if answer == INF else answer
