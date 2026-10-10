class Solution:
    def lengthOfLongestSubstringKDistinct(self, s, k):
        best = 0
        for i in range(len(s)):
            seen = set()
            for j in range(i, len(s)):
                seen.add(s[j])
                if len(seen) > k:
                    break
                best = max(best, j - i + 1)
        return best
