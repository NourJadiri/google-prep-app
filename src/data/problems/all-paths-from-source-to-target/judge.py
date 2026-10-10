# Every test is checked here. The two largest carry `expected: null` (8,192
# paths each would bloat the spec); for those an answer passes when every path
# is a real path from 0 to n - 1, none repeats, and there are as many as the
# graph has, counted by a small DP rather than listed. Checking each path also
# lets a failure say exactly what is wrong.


def count_paths(graph):
    target = len(graph) - 1
    memo = {target: 1}

    def ways(u):
        if u not in memo:
            total = 0
            for v in graph[u]:
                total += ways(v)
            memo[u] = total
        return memo[u]

    return ways(0)


def problem(path, graph):
    """Why `path` isn't a path from 0 to n - 1, or None when it is one."""
    n = len(graph)
    if not isinstance(path, list) or not path:
        return show(path, 120) + " is not a path: write each one as a list of node labels."
    if any(not isinstance(x, int) or isinstance(x, bool) for x in path):
        return show(path, 120) + " is not a list of node labels."
    if path[0] != 0 or path[-1] != n - 1:
        return show(path, 120) + " doesn't run from node 0 to node " + str(n - 1) + "."
    for a, b in zip(path, path[1:]):
        if not 0 <= a < n or b not in graph[a]:
            return show(path, 120) + " uses " + str(a) + " -> " + str(b) + ", which isn't an edge."
    return None


def check(got, expected, args):
    graph = args[0]
    if not isinstance(got, list):
        return "Return a list of paths; got " + show(got, 80) + "."
    seen = set()
    for path in got:
        why = problem(path, graph)
        if why:
            return why
        key = tuple(path)
        if key in seen:
            return "The path " + show(path, 120) + " appears more than once."
        seen.add(key)
    total = count_paths(graph) if expected is None else len(expected)
    if len(got) != total:
        message = "Found " + str(len(got)) + " of the " + str(total) + " paths."
        for path in expected or []:
            if tuple(path) not in seen:
                return message + " Missing, for one: " + show(path, 120) + "."
        return message
    return True
