# Links a copied neighbour only at the moment it's first discovered, so every
# edge that leads back to an already-copied node goes missing.
class Solution:
    def cloneGraph(self, node):
        if node is None:
            return None
        copies = {node: Node(node.val)}
        queue = deque([node])
        while queue:
            cur = queue.popleft()
            for nb in cur.neighbors:
                if nb not in copies:
                    copies[nb] = Node(nb.val)
                    copies[cur].neighbors.append(copies[nb])
                    queue.append(nb)
        return copies[node]
