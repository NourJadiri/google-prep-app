class Solution:
    def change(self, amount, coins):
        # Decide how many of each denomination to take, one denomination at a
        # time. Every complete choice that lands exactly on the amount is one
        # combination, so count those leaves.
        def count(i, left):
            if left == 0:
                return 1                   # the rest of the coins: take none
            if i == len(coins):
                return 0
            total = 0
            for k in range(left // coins[i] + 1):
                total += count(i + 1, left - k * coins[i])
            return total

        return count(0, amount)
