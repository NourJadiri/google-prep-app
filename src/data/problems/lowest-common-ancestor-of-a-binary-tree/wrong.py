# Collects p's ancestors but leaves p itself out. Whenever p is an ancestor of
# q the answer comes back one level too high, or as None when p is the root.
class Solution:
    def lowestCommonAncestor(self, root, p, q):
        parent = {root: None}
        stack = [root]
        while stack:
            node = stack.pop()
            for child in (node.left, node.right):
                if child is not None:
                    parent[child] = node
                    stack.append(child)
        above_p = set()
        node = parent[p]
        while node is not None:
            above_p.add(node)
            node = parent[node]
        node = q
        while node is not None and node not in above_p:
            node = parent[node]
        return node
