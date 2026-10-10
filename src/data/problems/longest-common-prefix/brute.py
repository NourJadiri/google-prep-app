class Solution:
    def longestCommonPrefix(self, strs):
        shortest = min(strs, key=len)
        for length in range(len(shortest), -1, -1):
            prefix = shortest[:length]
            if all(s.startswith(prefix) for s in strs):
                return prefix
        return ""
