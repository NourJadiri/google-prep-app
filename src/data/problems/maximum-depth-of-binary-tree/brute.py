class Solution:
    def maxDepth(self, root):
        # Count the rows: replace each row of nodes by the row of their
        # children until nothing is left.
        rows = 0
        row = [root] if root else []
        while row:
            rows += 1
            nxt = []
            for node in row:
                if node.left:
                    nxt.append(node.left)
                if node.right:
                    nxt.append(node.right)
            row = nxt
        return rows
