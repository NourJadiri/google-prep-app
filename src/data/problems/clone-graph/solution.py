class Solution:
    def cloneGraph(self, node: Optional['Node']) -> Optional['Node']:
        copies = {}                         # original node -> its copy

        def clone(original):
            if original in copies:          # copied already (or in progress): reuse it
                return copies[original]
            copy = Node(original.val)
            copies[original] = copy         # register before recursing, so a cycle
            for nb in original.neighbors:   # leading back here finds this copy
                copy.neighbors.append(clone(nb))
            return copy

        return clone(node) if node else None
