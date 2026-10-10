# Compares the values in preorder but never writes down the missing children,
# so different shapes that visit the same values in the same order look alike.
class Solution:
    def isSameTree(self, p, q):
        def walk(node, out):
            if node:
                out.append(node.val)
                walk(node.left, out)
                walk(node.right, out)
            return out

        return walk(p, []) == walk(q, [])
