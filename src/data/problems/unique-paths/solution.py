class Solution:
    def uniquePaths(self, m: int, n: int) -> int:
        # row[c] = number of routes to column c of the row being filled.
        # The top row is all 1s: the robot can only have come from the left.
        row = [1] * n
        for _ in range(1, m):
            for c in range(1, n):
                # Before this line row[c] is still the count from the row above;
                # row[c - 1] already holds this row's count to the left.
                row[c] += row[c - 1]
        return row[-1]
