# Greedy: always bites off the longest word that fits and never reconsiders.
# "carpetsale" takes "carpet", strands "sale", and says False.
class Solution:
    def wordBreak(self, s, wordDict):
        words = sorted(wordDict, key=len, reverse=True)
        i = 0
        while i < len(s):
            for w in words:
                if s.startswith(w, i):
                    i += len(w)
                    break
            else:
                return False
        return True
