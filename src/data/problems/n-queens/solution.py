class Solution:
    def solveNQueens(self, n: int) -> List[List[str]]:
        boards = []
        queens = []                      # queens[r] = column of the queen in row r
        cols, diag, anti = set(), set(), set()

        def place(r):
            if r == n:
                boards.append(["." * c + "Q" + "." * (n - 1 - c) for c in queens])
                return
            for c in range(n):
                # A square is attacked through its column, its "\" diagonal
                # (constant r - c) or its "/" diagonal (constant r + c).
                if c in cols or r - c in diag or r + c in anti:
                    continue                            # prune
                queens.append(c)                        # choose
                cols.add(c)
                diag.add(r - c)
                anti.add(r + c)
                place(r + 1)                            # explore the next row
                queens.pop()                            # un-choose
                cols.remove(c)
                diag.remove(r - c)
                anti.remove(r + c)

        place(0)
        return boards
