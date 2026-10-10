class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        last = {}            # character -> index of its latest occurrence
        start = best = 0     # invariant: s[start..i] has no repeated character
        for i, ch in enumerate(s):
            # Only a previous copy inside the window forces it to shrink. An
            # older copy (before start) must not drag start backwards.
            if last.get(ch, -1) >= start:
                start = last[ch] + 1
            last[ch] = i
            best = max(best, i - start + 1)
        return best
