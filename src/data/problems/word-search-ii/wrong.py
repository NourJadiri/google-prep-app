# Reports a word every time a path reaches it and never clears the mark, so a
# word that can be traced along two different paths comes back twice.
class Solution:
    def findWords(self, board, words):
        root = {}
        for w in words:
            node = root
            for ch in w:
                node = node.setdefault(ch, {})
            node["$"] = w

        rows, cols = len(board), len(board[0])
        found = []

        def dfs(r, c, node):
            ch = board[r][c]
            if ch not in node:
                return
            node = node[ch]
            if "$" in node:
                found.append(node["$"])
            board[r][c] = "#"
            for nr, nc in ((r - 1, c), (r + 1, c), (r, c - 1), (r, c + 1)):
                if 0 <= nr < rows and 0 <= nc < cols:
                    dfs(nr, nc, node)
            board[r][c] = ch

        for r in range(rows):
            for c in range(cols):
                dfs(r, c, root)
        return found
