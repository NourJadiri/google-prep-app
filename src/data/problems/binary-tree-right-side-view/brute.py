class Solution:
    def rightSideView(self, root):
        # Preorder, left before right: at every depth, the node visited last
        # is the rightmost one, so keep overwriting.
        last = {}

        def visit(node, depth):
            if node is None:
                return
            last[depth] = node.val
            visit(node.left, depth + 1)
            visit(node.right, depth + 1)

        visit(root, 0)
        return [last[d] for d in range(len(last))]
