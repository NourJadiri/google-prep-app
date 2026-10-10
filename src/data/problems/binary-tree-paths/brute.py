class Solution:
    def binaryTreePaths(self, root):
        # Record every node's parent breadth-first, then climb from each leaf.
        parent = {id(root): None}
        nodes, leaves = [root], []
        for node in nodes:
            kids = [c for c in (node.left, node.right) if c is not None]
            if not kids:
                leaves.append(node)
            for c in kids:
                parent[id(c)] = node
                nodes.append(c)
        out = []
        for leaf in leaves:
            vals, node = [], leaf
            while node is not None:
                vals.append(str(node.val))
                node = parent[id(node)]
            out.append("->".join(reversed(vals)))
        return out
