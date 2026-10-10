# Allows a ")" whenever fewer than n have been placed, instead of only when an
# open "(" is waiting to be matched, so strings like ")(" sneak in.
class Solution:
    def generateParenthesis(self, n):
        out, path = [], []

        def backtrack(opened, closed):
            if closed == n:
                out.append("".join(path))
                return
            if opened < n:
                path.append("(")
                backtrack(opened + 1, closed)
                path.pop()
            if closed < n:
                path.append(")")
                backtrack(opened, closed + 1)
                path.pop()

        backtrack(0, 0)
        return out
