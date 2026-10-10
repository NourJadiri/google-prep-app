class Solution:
    def lowestCommonAncestor(self, root, p, q):
        # Every node's parent, then climb: the first of q's ancestors (q
        # included) that is also an ancestor of p (p included) is the answer.
        parent = {root: None}
        stack = [root]
        while stack:
            node = stack.pop()
            for child in (node.left, node.right):
                if child is not None:
                    parent[child] = node
                    stack.append(child)
        above_p = set()
        while p is not None:
            above_p.add(p)
            p = parent[p]
        while q not in above_p:
            q = parent[q]
        return q
