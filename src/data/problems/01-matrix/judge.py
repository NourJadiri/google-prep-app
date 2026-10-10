# The largest tests store expected = null: their answers are 10,000-cell
# matrices, so they are recomputed here with two dynamic-programming sweeps
# (a different method from the reference's BFS). Every test is checked cell by
# cell, so a failure points at the first wrong cell.


def nearest_zero(mat):
    m, n = len(mat), len(mat[0])
    far = m + n
    d = [[0 if v == 0 else far for v in row] for row in mat]
    for r in range(m):
        for c in range(n):
            if r > 0:
                d[r][c] = min(d[r][c], d[r - 1][c] + 1)
            if c > 0:
                d[r][c] = min(d[r][c], d[r][c - 1] + 1)
    for r in range(m - 1, -1, -1):
        for c in range(n - 1, -1, -1):
            if r < m - 1:
                d[r][c] = min(d[r][c], d[r + 1][c] + 1)
            if c < n - 1:
                d[r][c] = min(d[r][c], d[r][c + 1] + 1)
    return d


def check(got, expected, args):
    if expected is None:
        expected = nearest_zero(args[0])
    if not isinstance(got, list):
        return "Expected a list of rows, got " + show(got) + "."
    if len(got) != len(expected):
        return "Expected " + str(len(expected)) + " rows, got " + str(len(got)) + "."
    for r, (row, want) in enumerate(zip(got, expected)):
        if not isinstance(row, list) or len(row) != len(want):
            return ("Row " + str(r) + " should be a list of " + str(len(want))
                    + " numbers, got " + show(row, 80) + ".")
        for c, (g, e) in enumerate(zip(row, want)):
            if not same(g, e):
                return "Cell [" + str(r) + "," + str(c) + "] is " + show(g) + ", expected " + show(e) + "."
    return True
