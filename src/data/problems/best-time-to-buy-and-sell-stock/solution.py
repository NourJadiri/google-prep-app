class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        lowest = prices[0]   # the cheapest price so far: the best day to have bought
        best = 0             # not trading is always allowed
        for price in prices:
            lowest = min(lowest, price)
            best = max(best, price - lowest)   # sell today, having bought at the low
        return best
