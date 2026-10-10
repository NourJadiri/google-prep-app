class Solution:
    def numSquares(self, n):
        # Breadth-first search over remainders: level k holds everything
        # reachable from n by subtracting k squares, so the first level that
        # reaches 0 is the fewest squares.
        level, frontier, seen = 0, [n], {n}
        while True:
            level += 1
            nxt = []
            for x in frontier:
                k = 1
                while k * k <= x:
                    y = x - k * k
                    if y == 0:
                        return level
                    if y not in seen:
                        seen.add(y)
                        nxt.append(y)
                    k += 1
            frontier = nxt
