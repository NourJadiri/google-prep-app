# The right idea with the parentheses missing: + binds tighter than &, so this
# computes (ans[i >> 1] + i) & 1 — always 0 or 1.
class Solution:
    def countBits(self, n):
        ans = [0] * (n + 1)
        for i in range(1, n + 1):
            ans[i] = ans[i >> 1] + i & 1
        return ans
