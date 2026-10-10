# Greedy: "x*" swallows as many characters as it can and never gives any back.
class Solution:
    def isMatch(self, s, p):
        i = j = 0
        while j < len(p):
            if j + 1 < len(p) and p[j + 1] == "*":
                while i < len(s) and p[j] in (s[i], "."):
                    i += 1
                j += 2
            else:
                if i == len(s) or p[j] not in (s[i], "."):
                    return False
                i += 1
                j += 1
        return i == len(s)
