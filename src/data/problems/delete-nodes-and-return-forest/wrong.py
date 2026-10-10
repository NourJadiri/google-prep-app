# Finds the right roots but never cuts a link, so a surviving parent still
# drags its deleted child, and everything under it, into its tree.
class Solution:
    def delNodes(self, root, to_delete):
        gone = set(to_delete)
        forest = []

        def visit(node, parent_gone):
            if node is None:
                return
            here_gone = node.val in gone
            if parent_gone and not here_gone:
                forest.append(node)
            visit(node.left, here_gone)
            visit(node.right, here_gone)

        visit(root, True)
        return forest
