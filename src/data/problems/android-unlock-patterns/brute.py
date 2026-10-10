class Solution:
    def numberOfPatterns(self, m, n):
        pos = {d: ((d - 1) // 3, (d - 1) % 3) for d in range(1, 10)}
        at = {p: d for d, p in pos.items()}

        def crossed(a, b):
            # A dot lies on the segment between two dots only if it is the
            # exact midpoint: both coordinate sums must be even.
            (r1, c1), (r2, c2) = pos[a], pos[b]
            if (r1 + r2) % 2 or (c1 + c2) % 2:
                return None
            return at[((r1 + r2) // 2, (c1 + c2) // 2)]

        total = 0

        def walk(path):
            nonlocal total
            if m <= len(path) <= n:
                total += 1
            if len(path) == n:
                return
            for d in range(1, 10):
                if d in path:
                    continue
                mid = crossed(path[-1], d)
                if mid is None or mid in path:
                    walk(path + [d])

        for start in range(1, 10):
            walk([start])
        return total
