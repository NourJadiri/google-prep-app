class Solution:
    def kWeakestRows(self, mat, k):
        # Count every row's soldiers cell by cell, then pick the weakest
        # remaining row k times (the earliest row wins a tie).
        counts = []
        for row in mat:
            c = 0
            for cell in row:
                if cell == 1:
                    c += 1
            counts.append(c)
        chosen = []
        remaining = list(range(len(mat)))
        for _ in range(k):
            best = remaining[0]
            for i in remaining:
                if counts[i] < counts[best]:
                    best = i
            chosen.append(best)
            remaining.remove(best)
        return chosen
