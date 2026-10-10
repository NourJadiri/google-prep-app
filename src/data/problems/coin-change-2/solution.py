class Solution:
    def change(self, amount: int, coins: List[int]) -> int:
        # ways[a] = how many combinations of the coins handled so far sum to a.
        # Coins sit in the OUTER loop: every combination is then assembled in
        # one fixed coin order, so it is counted exactly once.
        ways = [1] + [0] * amount          # one way to make 0: take nothing
        for coin in coins:
            # Ascending a: ways[a - coin] already includes this coin, so the
            # coin can be used again (unlimited supply).
            for a in range(coin, amount + 1):
                ways[a] += ways[a - coin]
        return ways[amount]
