# Jumps the window start past the previous copy even when that copy is already
# outside the window, which drags the start backwards: in "abba", the final
# "a" moves start back to 1 and "bba" gets counted.
class Solution:
    def lengthOfLongestSubstring(self, s):
        last = {}
        start = best = 0
        for i, ch in enumerate(s):
            if ch in last:
                start = last[ch] + 1
            last[ch] = i
            best = max(best, i - start + 1)
        return best
