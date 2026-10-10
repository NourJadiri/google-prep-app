# Guards columns and the "\" diagonals (r - c) but forgets the "/" diagonals
# (r + c), so queens attacking each other along those slip through.
class Solution:
    def solveNQueens(self, n):
        boards, queens = [], []
        cols, diag = set(), set()

        def place(r):
            if r == n:
                boards.append(["." * c + "Q" + "." * (n - 1 - c) for c in queens])
                return
            for c in range(n):
                if c in cols or r - c in diag:
                    continue
                queens.append(c)
                cols.add(c)
                diag.add(r - c)
                place(r + 1)
                queens.pop()
                cols.remove(c)
                diag.remove(r - c)

        place(0)
        return boards
