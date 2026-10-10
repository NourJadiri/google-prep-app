class Solution:
    def isValidBST(self, root):
        # The definition, word for word: at every node, everything in the left
        # subtree is smaller and everything in the right subtree is larger.
        def collect(node, out):
            if node is not None:
                collect(node.left, out)
                out.append(node.val)
                collect(node.right, out)
            return out

        def ok(node):
            if node is None:
                return True
            for v in collect(node.left, []):
                if v >= node.val:
                    return False
            for v in collect(node.right, []):
                if v <= node.val:
                    return False
            return ok(node.left) and ok(node.right)

        return ok(root)
