# The tests give the graph as an adjacency list: node i + 1's neighbours at
# index i. run() builds it from Node objects, hands your function node 1 (or
# None for an empty graph), checks that what comes back really is a separate
# copy, and turns it back into an adjacency list for comparison. A copy that
# isn't one comes back as a string explaining why, and check() fails with it.


def run(fn, args):
    adj = args[0]
    nodes = [Node(i + 1) for i in range(len(adj))]
    for node, nbrs in zip(nodes, adj):
        node.neighbors = [nodes[v - 1] for v in nbrs]
    track(*nodes)
    originals = {id(x) for x in nodes}
    before = [(node.val, list(node.neighbors)) for node in nodes]

    copy = fn(nodes[0] if nodes else None)

    for node, (val, nbrs) in zip(nodes, before):
        now = getattr(node, "neighbors", None)
        if (getattr(node, "val", None) != val or not isinstance(now, list)
                or len(now) != len(nbrs) or any(a is not b for a, b in zip(now, nbrs))):
            return "Your code changed the original graph (node " + str(val) + " isn't as it was)."
    if copy is None:
        return []
    if not (hasattr(copy, "val") and hasattr(copy, "neighbors")):
        return "Expected a Node or None, got " + type(copy).__name__ + "."

    # Walk the copy breadth first, one visit per node object.
    by_val, order, seen = {}, [copy], {id(copy)}
    track(copy)
    for cur in order:
        if not (hasattr(cur, "val") and hasattr(cur, "neighbors")):
            return "Your copy links to " + show(plain(cur)) + " where a Node should be."
        if id(cur) in originals:
            return "Node " + str(cur.val) + " in your result is an original node, not a copy."
        if cur.val in by_val:
            return ("Your copy has two different nodes with value " + str(cur.val)
                    + ": each original node should be copied exactly once.")
        by_val[cur.val] = cur
        for nb in cur.neighbors:
            if id(nb) not in seen:
                if len(order) > 2 * len(adj) + 10:
                    return "Your copy has far more nodes than the original graph."
                seen.add(id(nb))
                track(nb)
                order.append(nb)
    if sorted(by_val) != list(range(1, len(adj) + 1)):
        return ("Your copy reaches nodes " + show(sorted(by_val)) + ", but the graph has nodes 1 to "
                + str(len(adj)) + ".")
    return [[nb.val for nb in by_val[v].neighbors] for v in range(1, len(adj) + 1)]


def check(got, expected, args):
    if isinstance(got, str):
        return got
    if expected is None:          # large tests: the copy must match the input itself
        expected = args[0]
    return same(got, expected)
