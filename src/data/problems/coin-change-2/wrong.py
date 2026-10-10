# Amount in the outer loop: counts ordered sequences, so 3+5 and 5+3 are two ways.
class Solution:
    def change(self, amount, coins):
        ways = [1] + [0] * amount
        for a in range(1, amount + 1):
            for coin in coins:
                if coin <= a:
                    ways[a] += ways[a - coin]
        return ways[amount]
