# Subtracts one for every land neighbour instead of for every merge that
# actually happens: a cell touching the same island twice is counted twice.
class Solution:
    def numIslands2(self, m, n, positions):
        parent = {}

        def find(x):
            while parent[x] != x:
                x = parent[x]
            return x

        out, islands = [], 0
        for r, c in positions:
            cell = r * n + c
            if cell not in parent:
                parent[cell] = cell
                islands += 1
                for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                    nb = nr * n + nc
                    if 0 <= nr < m and 0 <= nc < n and nb in parent:
                        parent[find(nb)] = find(cell)
                        islands -= 1
            out.append(islands)
        return out
