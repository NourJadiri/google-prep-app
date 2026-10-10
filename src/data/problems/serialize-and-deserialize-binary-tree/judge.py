# Each test is one tree: ops is ["Codec"], args is [[tree]] with the tree in
# level order, and expected is that same tree (null on the largest tests,
# where it's read from the input instead). The tree is built here, serialised
# by one Codec, deserialised by a brand-new Codec, and the rebuilt tree comes
# back in level order to be compared with the original.


def run_design(cls, ops, args):
    root = to_tree(args[0][0])
    original = set()
    stack = [root]
    while stack:
        node = stack.pop()
        if node is not None:
            original.add(id(node))
            stack.append(node.left)
            stack.append(node.right)

    data = cls().serialize(root)
    if not isinstance(data, str):
        return {"problem": "serialize returned " + kind(data) + "; it has to return a str."}
    rebuilt = cls().deserialize(data)
    if rebuilt is not None and not looks_like_node(rebuilt):
        return {"problem": "deserialize returned " + kind(rebuilt) + "; it has to return the root node, or None for an empty tree."}
    try:
        values = from_tree(rebuilt)
    except ValueError as e:
        return {"problem": "deserialize built something that isn't a tree (" + str(e).replace("the returned tree", "it") + ")."}

    stack = [rebuilt]
    while stack:
        node = stack.pop()
        if node is not None:
            if id(node) in original:
                return {"problem": "deserialize handed back nodes of the original tree. It has to build a new tree from the string alone."}
            stack.append(node.left)
            stack.append(node.right)
    return values


def looks_like_node(x):
    return all(hasattr(x, a) for a in ("val", "left", "right"))


def kind(x):
    if x is None:
        return "None"
    name = type(x).__name__
    return ("an " if name[0] in "aeiouAEIOU" else "a ") + name


def check(got, expected, args):
    if isinstance(got, dict) and "problem" in got:
        return got["problem"]
    if expected is None:
        expected = from_tree(to_tree(args["args"][0][0]))
    if not isinstance(got, list):
        return False
    if same(got, expected):
        return True
    head = "deserialize(serialize(root)) doesn't give the same tree back. "
    n = min(len(got), len(expected))
    for k in range(n):
        if not same(got[k], expected[k]):
            return (head + "In level order, the first difference is entry " + str(k) + " (counting from 0): the rebuilt tree has "
                    + show(got[k]) + " where the original has " + show(expected[k]) + ".")
    if len(got) > len(expected):
        return head + "The rebuilt tree matches the original, then carries extra entries in level order: " + show(got[n:], 120) + "."
    return head + "The rebuilt tree stops early; in level order the original goes on with " + show(expected[n:], 120) + "."
