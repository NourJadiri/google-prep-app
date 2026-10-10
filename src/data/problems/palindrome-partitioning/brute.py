class Solution:
    def partition(self, s):
        # Each of the n - 1 gaps is cut or not; keep the splits whose pieces
        # all read the same reversed.
        n = len(s)
        out = []
        for mask in range(1 << (n - 1)):
            pieces, start = [], 0
            for k in range(n - 1):
                if mask >> k & 1:
                    pieces.append(s[start:k + 1])
                    start = k + 1
            pieces.append(s[start:])
            if all(p == p[::-1] for p in pieces):
                out.append(pieces)
        return out
