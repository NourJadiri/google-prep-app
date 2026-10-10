# Builds each row by updating one shared list in place and appends that same
# list every time, so every row in the answer ends up as the last row.
class Solution:
    def generate(self, numRows):
        rows = []
        row = []
        for i in range(numRows):
            row.append(1)
            for j in range(i - 1, 0, -1):
                row[j] += row[j - 1]
            rows.append(row)
        return rows
