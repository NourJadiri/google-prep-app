class Solution:
    def minCostClimbingStairs(self, cost: List[int]) -> int:
        # best(i) = the cheapest total toll to arrive at position i.
        # You may start on step 0 or step 1 for free: best(0) = best(1) = 0.
        # You arrive at i by climbing from i - 1 or from i - 2, paying that
        # step's toll: best(i) = min(best(i - 1) + cost[i - 1],
        #                            best(i - 2) + cost[i - 2]).
        # The top is position n. Only the last two answers are ever needed.
        two_back, one_back = 0, 0           # best(i - 2), best(i - 1), for i = 2
        for i in range(2, len(cost) + 1):
            two_back, one_back = one_back, min(one_back + cost[i - 1], two_back + cost[i - 2])
        return one_back
