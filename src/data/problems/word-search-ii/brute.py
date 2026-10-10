class Solution:
    def findWords(self, board, words):
        rows, cols = len(board), len(board[0])

        def trace(word, i, r, c, used):
            # Can word[i:] be spelled starting at (r, c) without reusing a cell?
            if (r, c) in used or board[r][c] != word[i]:
                return False
            if i == len(word) - 1:
                return True
            used.add((r, c))
            for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                if 0 <= nr < rows and 0 <= nc < cols and trace(word, i + 1, nr, nc, used):
                    used.remove((r, c))
                    return True
            used.remove((r, c))
            return False

        result = []
        for w in words:
            if any(trace(w, 0, r, c, set()) for r in range(rows) for c in range(cols)):
                result.append(w)
        return result
