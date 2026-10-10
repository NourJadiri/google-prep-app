# Accepts two-digit pieces with a leading zero: "06" is counted as the letter 6.
class Solution:
    def numDecodings(self, s):
        prev2, prev1 = 1, 1
        for i, ch in enumerate(s):
            cur = prev1 if ch != "0" else 0
            if i > 0 and int(s[i - 1:i + 1]) <= 26:
                cur += prev2
            prev2, prev1 = prev1, cur
        return prev1
