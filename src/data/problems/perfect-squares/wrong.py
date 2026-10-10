# Greedy: always takes the largest square that fits. 18 becomes 16+1+1, but 9+9 is shorter.
class Solution:
    def numSquares(self, n):
        count = 0
        while n:
            n -= math.isqrt(n) ** 2
            count += 1
        return count
