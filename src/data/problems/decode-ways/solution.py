class Solution:
    def numDecodings(self, s: str) -> int:
        # ways(i) = decodings of the first i digits. The last letter uses
        # either the last digit or the last two, so ways(i) needs only
        # ways(i - 1) and ways(i - 2): keep those two values.
        prev2, prev1 = 0, 1                      # prev1 = ways(0): the empty prefix, one way
        for i, ch in enumerate(s):
            cur = prev1 if ch != "0" else 0      # last letter is one digit, 1..9
            if i > 0 and 10 <= int(s[i - 1:i + 1]) <= 26:
                cur += prev2                     # last letter is two digits, 10..26
            prev2, prev1 = prev1, cur
        return prev1
