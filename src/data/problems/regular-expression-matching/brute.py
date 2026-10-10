class Solution:
    def isMatch(self, s, p):
        # Plain backtracking on the definition: no memo, exponential at worst.
        if not p:
            return not s
        first = bool(s) and p[0] in (s[0], ".")
        if len(p) >= 2 and p[1] == "*":
            # use the star element zero times, or once more
            return self.isMatch(s, p[2:]) or (first and self.isMatch(s[1:], p))
        return first and self.isMatch(s[1:], p[1:])
