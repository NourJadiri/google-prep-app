class Solution:
    def exist(self, board: List[List[str]], word: str) -> bool:
        m, n = len(board), len(board[0])
        # Cheap pruning before any search: the board must hold every letter
        # often enough, and starting from the rarer end of the word cuts the
        # search tree earlier.
        have = Counter(ch for row in board for ch in row)
        if any(have[ch] < k for ch, k in Counter(word).items()):
            return False
        if have[word[0]] > have[word[-1]]:
            word = word[::-1]

        def dfs(r, c, i):
            # Does word[i:] start at (r, c), without reusing a borrowed cell?
            if board[r][c] != word[i]:
                return False
            if i == len(word) - 1:
                return True
            board[r][c] = "#"           # borrow the cell for the rest of this path
            found = False
            for x, y in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                if 0 <= x < m and 0 <= y < n and dfs(x, y, i + 1):
                    found = True
                    break
            board[r][c] = word[i]       # give it back: other paths may need it
            return found

        return any(dfs(r, c, 0) for r in range(m) for c in range(n))
