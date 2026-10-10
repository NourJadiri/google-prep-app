# The tests give the tree in level order and p, q as values. The tree is built
# here, p and q are looked up in it, and the function gets real nodes of that
# tree. The answer has to be one of those nodes, so it's checked by identity
# and then reported by its value.


def run(fn, args):
    values, p, q = args
    root = to_tree(values)
    members = set()
    stack = [root]
    while stack:
        node = stack.pop()
        if node is not None:
            members.add(id(node))
            stack.append(node.left)
            stack.append(node.right)
    got = fn(root, find_node(root, p), find_node(root, q))
    if got is not None and id(got) in members:
        return got.val
    return {"notANode": describe(got)}


def describe(x):
    if x is None:
        return "None"
    if hasattr(x, "val") and hasattr(x, "left") and hasattr(x, "right"):
        return "a node holding " + show(plain(x.val), 40) + " that isn't part of the given tree"
    if isinstance(x, (bool, int, float, str)):
        return show(x, 40) + ", a value rather than a node"
    return "a " + type(x).__name__


def check(got, expected, args):
    if isinstance(got, dict) and "notANode" in got:
        return "lowestCommonAncestor has to return one of the tree's own nodes; it returned " + got["notANode"] + "."
    if same(got, expected):
        return True
    _, p, q = args
    return ("Returned the node holding " + show(got, 40) + ", but the lowest common ancestor of "
            + show(p, 40) + " and " + show(q, 40) + " is the node holding " + show(expected, 40) + ".")
