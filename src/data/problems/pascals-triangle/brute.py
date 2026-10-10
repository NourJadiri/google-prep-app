from math import comb


class Solution:
    def generate(self, numRows):
        # Entry j of row i counts the ways to choose j things out of i.
        return [[comb(i, j) for j in range(i + 1)] for i in range(numRows)]
