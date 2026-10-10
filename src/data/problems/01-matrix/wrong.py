# One dynamic-programming sweep from the top-left only: a cell never hears
# about a 0 that lies below it or to its right.
class Solution:
    def updateMatrix(self, mat):
        m, n = len(mat), len(mat[0])
        far = m + n
        d = [[0 if v == 0 else far for v in row] for row in mat]
        for r in range(m):
            for c in range(n):
                if r > 0:
                    d[r][c] = min(d[r][c], d[r - 1][c] + 1)
                if c > 0:
                    d[r][c] = min(d[r][c], d[r][c - 1] + 1)
        return d
