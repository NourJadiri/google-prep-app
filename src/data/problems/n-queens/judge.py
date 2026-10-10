# Every test is checked here. n = 10 carries `expected: null` (724 boards
# would bloat the spec); there an answer passes when every board is a legal
# placement, none repeats, and there are as many as a bitmask search counts.
# Checking each board also lets a failure say exactly what is wrong.


def count_solutions(n):
    full = (1 << n) - 1

    def go(cols, left, right):
        if cols == full:
            return 1
        total = 0
        free = full & ~(cols | left | right)
        while free:
            bit = free & -free
            free ^= bit
            total += go(cols | bit, (left | bit) << 1 & full, (right | bit) >> 1)
        return total

    return go(0, 0, 0)


def problem(board, n):
    """Why `board` isn't a solution for this n, or None when it is one."""
    shape = str(n) + " strings of length " + str(n)
    if not isinstance(board, list) or len(board) != n:
        return show(board, 200) + " is not a board of " + shape + "."
    if not all(isinstance(row, str) and len(row) == n for row in board):
        return show(board, 200) + " is not a board of " + shape + "."
    if any(set(row) - {"Q", "."} for row in board):
        return show(board, 200) + " uses characters other than 'Q' and '.'."
    if any(row.count("Q") != 1 for row in board):
        return show(board, 200) + " doesn't have exactly one queen in every row."
    cols = [row.index("Q") for row in board]
    for a in range(n):
        for b in range(a + 1, n):
            if cols[a] == cols[b]:
                return show(board, 200) + ": the queens in rows " + str(a) + " and " + str(b) + " share a column."
            if abs(cols[a] - cols[b]) == b - a:
                return show(board, 200) + ": the queens in rows " + str(a) + " and " + str(b) + " share a diagonal."
    return None


def check(got, expected, args):
    n = args[0]
    if not isinstance(got, list):
        return "Return a list of boards; got " + show(got, 80) + "."
    seen = set()
    for board in got:
        why = problem(board, n)
        if why:
            return why
        key = tuple(board)
        if key in seen:
            return "The board " + show(board, 200) + " appears more than once."
        seen.add(key)
    total = count_solutions(n) if expected is None else len(expected)
    if len(got) != total:
        message = "Found " + str(len(got)) + " of the " + str(total) + " placements."
        for board in expected or []:
            if tuple(board) not in seen:
                return message + " Missing, for one: " + show(board, 200) + "."
        return message
    return True
