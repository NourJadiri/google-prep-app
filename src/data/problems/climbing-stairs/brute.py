from math import comb


class Solution:
    def climbStairs(self, n):
        # Count by how many 2-steps the climb uses. With k of them there are
        # n - 2k 1-steps, n - k moves in all, and the 2-steps can be any k of
        # those n - k moves.
        return sum(comb(n - k, k) for k in range(n // 2 + 1))
