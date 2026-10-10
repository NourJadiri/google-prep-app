class Solution:
    def longestPalindrome(self, s):
        # Every length from longest to shortest, every start: the first
        # substring that equals its own reverse is a longest palindrome.
        n = len(s)
        for length in range(n, 0, -1):
            for i in range(n - length + 1):
                t = s[i:i + length]
                if t == t[::-1]:
                    return t
