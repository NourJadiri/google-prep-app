class Solution:
    def coinChange(self, coins: List[int], amount: int) -> int:
        # dp[a] = fewest coins that make exactly a. Every coin is worth at
        # least 1, so no answer uses more than `amount` coins: amount + 1
        # safely means "can't be made".
        impossible = amount + 1
        dp = [0] + [impossible] * amount
        for a in range(1, amount + 1):
            for c in coins:
                if c <= a:
                    dp[a] = min(dp[a], dp[a - c] + 1)   # last coin is c
        return dp[amount] if dp[amount] != impossible else -1
