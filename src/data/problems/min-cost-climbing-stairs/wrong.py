# Greedy: start on the cheaper of the first two steps, then always move to the
# cheaper of the next two. A cheap step now can force a dear one later.
class Solution:
    def minCostClimbingStairs(self, cost):
        n = len(cost)
        i = 0 if cost[0] <= cost[1] else 1
        total = 0
        while i < n:
            total += cost[i]
            if i + 2 >= n:          # a 2-step from here reaches the top
                break
            i = i + 1 if cost[i + 1] < cost[i + 2] else i + 2
        return total
