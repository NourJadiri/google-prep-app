# Greedy: pay with the biggest coin that fits, as a cashier would. Right for
# everyday currencies, wrong for [1, 6, 10] and 12 (10+1+1 instead of 6+6),
# and it gives up on [5, 7] and 10 after taking the 7.
class Solution:
    def coinChange(self, coins, amount):
        count = 0
        for c in sorted(coins, reverse=True):
            count += amount // c
            amount %= c
        return count if amount == 0 else -1
