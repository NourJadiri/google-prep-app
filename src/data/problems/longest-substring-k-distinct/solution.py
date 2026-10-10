class Solution:
    def lengthOfLongestSubstringKDistinct(self, s: str, k: int) -> int:
        counts = {}            # character -> occurrences inside the window s[left..right]
        left = best = 0
        for right, ch in enumerate(s):
            counts[ch] = counts.get(ch, 0) + 1
            # Repair before measuring: shrink from the left until the window
            # holds at most k distinct characters again.
            while len(counts) > k:
                out = s[left]
                counts[out] -= 1
                if counts[out] == 0:
                    del counts[out]      # keeps len(counts) equal to the distinct count
                left += 1
            best = max(best, right - left + 1)
        return best
