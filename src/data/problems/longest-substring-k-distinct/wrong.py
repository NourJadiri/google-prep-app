# Measures the window before repairing it, so a window that has just gone
# over budget gets recorded.
class Solution:
    def lengthOfLongestSubstringKDistinct(self, s, k):
        counts = {}
        left = best = 0
        for right, ch in enumerate(s):
            counts[ch] = counts.get(ch, 0) + 1
            best = max(best, right - left + 1)
            while len(counts) > k:
                counts[s[left]] -= 1
                if counts[s[left]] == 0:
                    del counts[s[left]]
                left += 1
        return best
