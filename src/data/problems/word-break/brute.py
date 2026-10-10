class Solution:
    def wordBreak(self, s, wordDict):
        words = set(wordDict)

        # Try every word that could come first, then split the rest the same
        # way. No memo, so it re-solves the same suffix again and again.
        def splits(start):
            if start == len(s):
                return True
            for end in range(start + 1, len(s) + 1):
                if s[start:end] in words and splits(end):
                    return True
            return False

        return splits(0)
