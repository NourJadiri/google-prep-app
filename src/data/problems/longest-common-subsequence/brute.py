from itertools import combinations


class Solution:
    def longestCommonSubsequence(self, text1, text2):
        short, long_ = sorted((text1, text2), key=len)

        def is_subsequence(t, s):
            k = 0
            for ch in s:
                if k < len(t) and t[k] == ch:
                    k += 1
            return k == len(t)

        # Try every subsequence of the shorter string, longest first.
        for size in range(len(short), 0, -1):
            for picks in combinations(range(len(short)), size):
                if is_subsequence("".join(short[i] for i in picks), long_):
                    return size
        return 0
