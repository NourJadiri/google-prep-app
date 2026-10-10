# Three separate passes: find every node, make one copy per value, then wire
# each copy's neighbours by value.
class Solution:
    def cloneGraph(self, node):
        if node is None:
            return None
        found = {node.val: node}
        stack = [node]
        while stack:
            cur = stack.pop()
            for nb in cur.neighbors:
                if nb.val not in found:
                    found[nb.val] = nb
                    stack.append(nb)
        copy = {v: Node(v) for v in found}
        for v, original in found.items():
            copy[v].neighbors = [copy[nb.val] for nb in original.neighbors]
        return copy[node.val]
