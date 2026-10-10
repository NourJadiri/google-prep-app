# Marks cells as used but never un-marks them when a path fails, so a dead end
# explored early blocks the cells a later, correct path needs.
class Solution:
    def exist(self, board, word):
        m, n = len(board), len(board[0])
        used = set()

        def dfs(r, c, i):
            if i == len(word):
                return True
            if not (0 <= r < m and 0 <= c < n) or (r, c) in used or board[r][c] != word[i]:
                return False
            used.add((r, c))
            return (dfs(r + 1, c, i + 1) or dfs(r - 1, c, i + 1)
                    or dfs(r, c + 1, i + 1) or dfs(r, c - 1, i + 1))

        return any(dfs(r, c, 0) for r in range(m) for c in range(n))
