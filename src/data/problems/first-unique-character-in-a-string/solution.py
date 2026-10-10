class Solution:
    def firstUniqChar(self, s: str) -> int:
        count = Counter(s)              # pass 1: how often each letter appears
        for i, ch in enumerate(s):      # pass 2: in string order, not alphabetical
            if count[ch] == 1:
                return i
        return -1
