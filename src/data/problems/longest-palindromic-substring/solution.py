class Solution:
    def longestPalindrome(self, s: str) -> str:
        def expand(lo, hi):
            # Grow outwards while the ends match. The loop overshoots by one
            # on each side, so the palindrome is s[lo + 1:hi].
            while lo >= 0 and hi < len(s) and s[lo] == s[hi]:
                lo -= 1
                hi += 1
            return lo + 1, hi

        best = (0, 1)
        for i in range(len(s)):
            # Centre on character i (odd length) and on the gap after it (even).
            for lo, hi in (expand(i, i), expand(i, i + 1)):
                if hi - lo > best[1] - best[0]:
                    best = (lo, hi)
        return s[best[0]:best[1]]
