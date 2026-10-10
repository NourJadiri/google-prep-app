class Solution:
    def minDistance(self, word1, word2):
        # Straight from the definition, on suffixes: at the first position of
        # each, try every edit that could happen there (and keeping a matching
        # character), recursing on what's left.
        @cache
        def d(i, j):
            if i == len(word1):
                return len(word2) - j          # insert the rest of word2
            if j == len(word2):
                return len(word1) - i          # delete the rest of word1
            return min(
                1 + d(i + 1, j),                              # delete word1[i]
                1 + d(i, j + 1),                              # insert word2[j]
                (word1[i] != word2[j]) + d(i + 1, j + 1),     # keep or replace
            )

        return d(0, 0)
