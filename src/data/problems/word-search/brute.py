# Grow every path explicitly, as a tuple of cells, with a stack instead of
# recursion. A path is extended only by a neighbour that isn't already on it
# and that holds the next letter.
class Solution:
    def exist(self, board, word):
        m, n = len(board), len(board[0])
        stack = [((r, c),) for r in range(m) for c in range(n) if board[r][c] == word[0]]
        while stack:
            path = stack.pop()
            if len(path) == len(word):
                return True
            r, c = path[-1]
            for x, y in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                if 0 <= x < m and 0 <= y < n and (x, y) not in path \
                        and board[x][y] == word[len(path)]:
                    stack.append(path + ((x, y),))
        return False
