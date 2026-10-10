from itertools import permutations


class Solution:
    def solveNQueens(self, n):
        # One queen per row and per column is a permutation of the columns;
        # keep the ones where no two queens share a diagonal.
        out = []
        for cols in permutations(range(n)):
            if all(abs(cols[a] - cols[b]) != b - a for a in range(n) for b in range(a + 1, n)):
                out.append(["." * c + "Q" + "." * (n - 1 - c) for c in cols])
        return out
