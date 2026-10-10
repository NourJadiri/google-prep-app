# No walls, so the distance between two cells is just |dr| + |dc|: for every
# cell, take the smallest such distance to any 0.
class Solution:
    def updateMatrix(self, mat):
        m, n = len(mat), len(mat[0])
        zeros = [(r, c) for r in range(m) for c in range(n) if mat[r][c] == 0]
        return [[min(abs(r - zr) + abs(c - zc) for zr, zc in zeros) for c in range(n)]
                for r in range(m)]
