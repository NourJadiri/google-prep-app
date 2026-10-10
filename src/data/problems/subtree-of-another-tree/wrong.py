# Finds the first node whose value matches subRoot's root and compares only
# there, but a later node with the same value might be the real copy.
class Solution:
    def isSubtree(self, root, subRoot):
        def same(a, b):
            if a is None or b is None:
                return a is b
            return a.val == b.val and same(a.left, b.left) and same(a.right, b.right)

        queue = [root]
        for node in queue:
            if node.val == subRoot.val:
                return same(node, subRoot)
            queue += [c for c in (node.left, node.right) if c]
        return False
