# Stops comparing once either string runs out of characters, so a final text
# that is a suffix of the other ("ab" vs "b") looks equal.
class Solution:
    def backspaceCompare(self, s, t):
        i, j = len(s) - 1, len(t) - 1
        skip_s = skip_t = 0
        while i >= 0 or j >= 0:
            while i >= 0:
                if s[i] == "#":
                    skip_s += 1
                elif skip_s:
                    skip_s -= 1
                else:
                    break
                i -= 1
            while j >= 0:
                if t[j] == "#":
                    skip_t += 1
                elif skip_t:
                    skip_t -= 1
                else:
                    break
                j -= 1
            if i >= 0 and j >= 0 and s[i] != t[j]:
                return False
            i -= 1
            j -= 1
        return True
