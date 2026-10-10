# Expands only around characters, so even-length palindromes like "abba" are never found.
class Solution:
    def longestPalindrome(self, s):
        best = s[0]
        for i in range(len(s)):
            lo, hi = i, i
            while lo >= 0 and hi < len(s) and s[lo] == s[hi]:
                lo -= 1
                hi += 1
            if hi - lo - 1 > len(best):
                best = s[lo + 1:hi]
        return best
