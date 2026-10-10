# Most tests carry their expected counts. The big ones carry null — ten
# thousand counts apiece — and are checked against this simulation instead:
# union-find with union by rank, run here on the same positions.


def simulate(m, n, positions):
    parent, rank = {}, {}

    def find(x):
        root = x
        while parent[root] != root:
            root = parent[root]
        while parent[x] != root:            # full path compression
            parent[x], x = root, parent[x]
        return root

    out, islands = [], 0
    for r, c in positions:
        key = (r, c)
        if key not in parent:
            parent[key], rank[key] = key, 0
            islands += 1
            for nb in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                if nb in parent:            # only cells inside the grid are ever stored
                    a, b = find(key), find(nb)
                    if a != b:
                        if rank[a] < rank[b]:
                            a, b = b, a
                        parent[b] = a
                        rank[a] += rank[a] == rank[b]
                        islands -= 1
        out.append(islands)
    return out


def check(got, expected, args):
    if expected is None:
        expected = simulate(*args)
    if same(got, expected):
        return True
    if not isinstance(got, list):
        return False
    if len(got) != len(expected):
        return "Returned " + str(len(got)) + " counts for " + str(len(expected)) + " positions."
    for i, (g, e) in enumerate(zip(got, expected)):
        if not same(g, e):
            return ("After step " + str(i) + " (cell " + show(args[2][i]) + ") the count is "
                    + show(g, 40) + ", expected " + show(e, 40) + ".")
    return False
