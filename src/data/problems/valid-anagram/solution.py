class Solution:
    def isAnagram(self, s: str, t: str) -> bool:
        if len(s) != len(t):
            return False
        count = {}
        for ch in s:                    # how many of each letter s has
            count[ch] = count.get(ch, 0) + 1
        for ch in t:                    # t spends them
            if count.get(ch, 0) == 0:   # t needs a letter s has run out of
                return False
            count[ch] -= 1
        # Equal lengths and t never overspent, so every count is back at 0.
        return True
