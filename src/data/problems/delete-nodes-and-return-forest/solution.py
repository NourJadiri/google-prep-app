class Solution:
    def delNodes(self, root: Optional[TreeNode], to_delete: List[int]) -> List[TreeNode]:
        doomed = set(to_delete)
        forest = []

        def visit(node, parent_gone):
            # Returns what the parent should keep as this child: the node
            # itself, or None when it's deleted. Storing that None cuts the link.
            if node is None:
                return None
            gone = node.val in doomed
            if parent_gone and not gone:
                forest.append(node)          # nothing above it survives: a new root
            node.left = visit(node.left, gone)
            node.right = visit(node.right, gone)
            return None if gone else node

        visit(root, True)                    # the root has no parent, so it starts a tree
        return forest
