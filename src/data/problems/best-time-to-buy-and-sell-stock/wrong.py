# Always buys on the cheapest day overall, then sells at the best price after
# it. But the best trade can happen entirely before that low point.
class Solution:
    def maxProfit(self, prices):
        buy = prices.index(min(prices))
        return max(prices[buy:]) - prices[buy]
