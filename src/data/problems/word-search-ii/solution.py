class TrieNode:
    def __init__(self):
        self.children = {}      # letter -> TrieNode
        self.word = None        # the whole word that ends here, if any


class Solution:
    def findWords(self, board: List[List[str]], words: List[str]) -> List[str]:
        root = TrieNode()
        for w in words:
            node = root
            for ch in w:
                if ch not in node.children:
                    node.children[ch] = TrieNode()
                node = node.children[ch]
            node.word = w

        rows, cols = len(board), len(board[0])
        found = []

        def dfs(r, c, parent):
            ch = board[r][c]
            node = parent.children[ch]
            if node.word is not None:
                found.append(node.word)
                node.word = None            # report each word once
            board[r][c] = "#"               # the current path is using this cell
            for nr, nc in ((r - 1, c), (r + 1, c), (r, c - 1), (r, c + 1)):
                if 0 <= nr < rows and 0 <= nc < cols and board[nr][nc] in node.children:
                    dfs(nr, nc, node)
            board[r][c] = ch                # free it for other paths
            if not node.children and node.word is None:
                del parent.children[ch]     # nothing left to find down here: prune

        for r in range(rows):
            for c in range(cols):
                if board[r][c] in root.children:
                    dfs(r, c, root)
        return found
