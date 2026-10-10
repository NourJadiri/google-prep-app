class Solution:
    def numSquares(self, n: int) -> int:
        squares = [k * k for k in range(1, math.isqrt(n) + 1)]
        # fewest[i] = the fewest perfect squares that sum to i. Take a best sum
        # for i and remove its last square s: what's left is a best sum for
        # i - s. So try every square as the last one.
        fewest = list(range(n + 1))        # i = 1 + 1 + ... + 1 is an upper bound
        for i in range(2, n + 1):
            for s in squares:
                if s > i:
                    break
                fewest[i] = min(fewest[i], fewest[i - s] + 1)
        return fewest[n]
