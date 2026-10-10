class Solution:
    def isSubsequence(self, s: str, t: str) -> bool:
        i = 0   # s[:i] is matched so far; s[i] is the letter we're looking for
        for ch in t:
            # Take the first chance to match s[i]: an earlier match leaves more
            # of t for the letters still to come.
            if i < len(s) and ch == s[i]:
                i += 1
        return i == len(s)
