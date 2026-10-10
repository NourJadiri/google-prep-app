# Walks the alphabet and returns the first letter that occurs once -- that's
# the alphabetically first unique letter, not the leftmost one.
class Solution:
    def firstUniqChar(self, s):
        for ch in "abcdefghijklmnopqrstuvwxyz":
            if s.count(ch) == 1:
                return s.index(ch)
        return -1
