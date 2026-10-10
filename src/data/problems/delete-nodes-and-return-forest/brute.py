class Solution:
    def delNodes(self, root, to_delete):
        gone = set(to_delete)
        # Every node with its parent, breadth first.
        order, parent = [root], {root: None}
        for node in order:
            for child in (node.left, node.right):
                if child is not None:
                    parent[child] = node
                    order.append(child)
        # A survivor starts a tree when there is no surviving node above it.
        roots = [n for n in order
                 if n.val not in gone and (parent[n] is None or parent[n].val in gone)]
        # Then cut every link that leads into a deleted node.
        for n in order:
            if n.left is not None and n.left.val in gone:
                n.left = None
            if n.right is not None and n.right.val in gone:
                n.right = None
        return roots
