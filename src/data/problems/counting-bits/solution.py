class Solution:
    def countBits(self, n: int) -> List[int]:
        ans = [0] * (n + 1)
        for i in range(1, n + 1):
            # i >> 1 is i with its last bit dropped: a smaller number, already
            # counted. Add the dropped bit back: i & 1 (the parentheses matter,
            # since + binds tighter than &).
            ans[i] = ans[i >> 1] + (i & 1)
        return ans
