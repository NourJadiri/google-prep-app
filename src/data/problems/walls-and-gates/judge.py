# The small tests carry their expected grids. The big ones carry null — a
# 250 x 250 answer is too large to store — and are checked against a plain
# multi-source BFS run here on the original grid.
from collections import deque

OPEN = 2147483647


def distances(rooms):
    m, n = len(rooms), len(rooms[0])
    out = [row[:] for row in rooms]
    frontier = [(r, c) for r in range(m) for c in range(n) if rooms[r][c] == 0]
    d = 0
    while frontier:                      # one ring at a time
        d += 1
        nxt = []
        for r, c in frontier:
            for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                if 0 <= nr < m and 0 <= nc < n and out[nr][nc] == OPEN:
                    out[nr][nc] = d
                    nxt.append((nr, nc))
        frontier = nxt
    return out


def check(got, expected, args):
    if expected is None:
        expected = distances(args[0])
    if same(got, expected):
        return True
    if not isinstance(got, list) or len(got) != len(expected):
        return False
    for r, (grow, erow) in enumerate(zip(got, expected)):
        if not isinstance(grow, list) or len(grow) != len(erow):
            return "Row " + str(r) + " of rooms changed shape."
        for c, (g, e) in enumerate(zip(grow, erow)):
            if not same(g, e):
                return "rooms[" + str(r) + "][" + str(c) + "] is " + show(g, 40) + " after the call, expected " + show(e, 40) + "."
    return False
