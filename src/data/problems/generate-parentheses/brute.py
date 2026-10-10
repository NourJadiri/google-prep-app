from itertools import product


class Solution:
    def generateParenthesis(self, n):
        # Every string of 2n parentheses, kept when it never dips below zero
        # and ends level.
        out = []
        for chars in product("()", repeat=2 * n):
            depth = 0
            for ch in chars:
                depth += 1 if ch == "(" else -1
                if depth < 0:
                    break
            if depth == 0:
                out.append("".join(chars))
        return out
