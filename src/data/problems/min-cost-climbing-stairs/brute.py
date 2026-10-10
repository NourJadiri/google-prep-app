class Solution:
    def minCostClimbingStairs(self, cost):
        # Shortest path, found by brute relaxation: positions 0..n, a move from
        # i to i + 1 or i + 2 costs cost[i], positions 0 and 1 are free starts.
        # Keep improving every position until a full pass changes nothing.
        n = len(cost)
        best = [None] * (n + 1)
        best[0] = best[1] = 0
        changed = True
        while changed:
            changed = False
            for i in range(n):
                if best[i] is None:
                    continue
                for j in (i + 1, i + 2):
                    if j <= n and (best[j] is None or best[i] + cost[i] < best[j]):
                        best[j] = best[i] + cost[i]
                        changed = True
        return best[n]
