class Solution:
    def generateParenthesis(self, n: int) -> List[str]:
        out, path = [], []

        def backtrack(opened, closed):
            if closed == n:                     # then opened == n too: complete
                out.append("".join(path))
                return
            if opened < n:                      # an opener is still available
                path.append("(")                # choose
                backtrack(opened + 1, closed)   # explore
                path.pop()                      # un-choose
            if closed < opened:                 # there's an open "(" to match
                path.append(")")
                backtrack(opened, closed + 1)
                path.pop()

        backtrack(0, 0)
        return out
