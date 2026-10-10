class Solution:
    def generate(self, numRows: int) -> List[List[int]]:
        rows = [[1]]
        for _ in range(numRows - 1):
            above = rows[-1]
            # Both ends are 1; each number in between is the sum of the two
            # numbers above it.
            middle = [above[j - 1] + above[j] for j in range(1, len(above))]
            rows.append([1] + middle + [1])
        return rows
